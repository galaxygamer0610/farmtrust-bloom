# Backend Architecture

## Overview

This backend is a **data assembly and forwarding layer** that sits between the frontend and the ML microservice. It does NOT implement any ML logic itself.

## Request Flow

```
┌─────────────┐
│   Frontend  │
│  (Web Form) │
└──────┬──────┘
       │ POST /api/v1/assess
       │ (11 farmer fields)
       ▼
┌─────────────────────────────────────────────────────────┐
│              Backend API Server (Node.js)               │
│                                                         │
│  Step 1: Validate Request                              │
│  ├─ Check required fields                              │
│  ├─ Validate enum values                               │
│  └─ Validate numeric constraints                       │
│                                                         │
│  Step 2: Auto-Compute Derived Fields                   │
│  ├─ net_profit = revenue - expenses                    │
│  └─ debt_to_equity = loan / (revenue * 2)              │
│                                                         │
│  Step 3: Fetch External API Data (Concurrent)          │
│  ├─ IMD API → temperature, rainfall                    │
│  ├─ NDMA API → drought_index, flood_risk               │
│  ├─ AGMARKNET → commodity_price_index                  │
│  ├─ Agri Ministry → input_cost_index                   │
│  └─ Policy DB → policy_support_score                   │
│     (All 5 calls run in parallel via Promise.all)      │
│                                                         │
│  Step 4: Assemble 18-Field Payload                     │
│  └─ Combine farmer + derived + external data           │
│                                                         │
│  Step 5: Forward to ML Microservice                    │
│  └─ POST to ngrok URL                                  │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
         ┌────────────────────┐
         │  ML Microservice   │
         │  (ngrok tunnel)    │
         │                    │
         │  ├─ XGBoost Model  │
         │  ├─ Feature Eng.   │
         │  └─ Subsidy Match  │
         └────────┬───────────┘
                  │
                  │ Response
                  ▼
         ┌────────────────────┐
         │  Credit Assessment │
         │  + Subsidies       │
         └────────┬───────────┘
                  │
                  ▼
         ┌────────────────────┐
         │     Frontend       │
         └────────────────────┘
```

## Data Transformation

### Input (11 fields from frontend)
```json
{
  "enterprise_size": "Small",
  "region": "East",
  "quarter": "Q2",
  "annual_revenue": 280.0,
  "annual_expenses": 195.0,
  "loan_amount": 120.0,
  "landholding_size": 1.5,
  "crop_type": "Rice",
  "irrigation_type": "Rainfed"
}
```

### After Step 2: Add Derived Fields (+2 fields)
```json
{
  ...previous fields,
  "net_profit": 85.0,           // computed
  "debt_to_equity": 0.214       // computed
}
```

### After Step 3: Add External API Data (+7 fields)
```json
{
  ...previous fields,
  "avg_temperature": 27.1,      // from IMD
  "rainfall": 1420.0,           // from IMD
  "drought_index": 0.30,        // from NDMA
  "flood_risk": 0.70,           // from NDMA
  "commodity_price_index": 118.5, // from AGMARKNET
  "input_cost_index": 92.0,     // from Agri Ministry
  "policy_support_score": 2     // from Policy DB
}
```

### Final Payload to ML Service (18 fields total)
```json
{
  "enterprise_id": "FARM-001",
  "enterprise_size": "Small",
  "region": "East",
  "quarter": "Q2",
  "annual_revenue": 280.0,
  "annual_expenses": 195.0,
  "loan_amount": 120.0,
  "net_profit": 85.0,
  "debt_to_equity": 0.214,
  "avg_temperature": 27.1,
  "rainfall": 1420.0,
  "drought_index": 0.30,
  "flood_risk": 0.70,
  "commodity_price_index": 118.5,
  "input_cost_index": 92.0,
  "policy_support_score": 2,
  "landholding_size": 1.5,
  "crop_type": "Rice",
  "irrigation_type": "Rainfed"
}
```

## Module Structure

```
backend/
├── server.js                    # Express app, middleware, error handling
├── config/
│   └── config.js               # Environment variables, app settings
├── routes/
│   └── assess.js               # Route handlers for all endpoints
├── services/
│   ├── apiFetcher.js           # External API calls (concurrent)
│   ├── assembler.js            # Payload assembly logic
│   ├── mlClient.js             # ML microservice HTTP client
│   └── mockData.js             # Development mock data
└── utils/
    ├── logger.js               # Structured JSON logging
    └── validation.js           # Request validation & enums
```

## Key Design Decisions

### 1. Concurrent API Calls
All 5 external API calls run in parallel using `Promise.all()`:
```javascript
const [imdData, ndmaData, agmarkData, agriData, policyData] = await Promise.all([
  fetchIMD(region),
  fetchNDMA(region),
  fetchAgmarknet(region, cropType),
  fetchAgriMinistry(region),
  fetchPolicy(region),
]);
```

**Benefit:** Total latency = max(individual calls), not sum. Typically ~300ms instead of ~1500ms.

### 2. Graceful Fallbacks
Every external API call is wrapped in try/catch. On failure:
- Log a warning
- Use default fallback value
- Continue processing
- **Never** fail the entire request

```javascript
try {
  const response = await axios.get(url, { timeout: 5000 });
  return response.data;
} catch (error) {
  logger.warn('API call failed, using fallback', { error: error.message });
  return { field: DEFAULT_VALUE };
}
```

### 3. Development Mode
When `APP_ENV=development`:
- Skip all real HTTP calls to external APIs
- Use mock data from training dataset statistics
- Instant response (no network latency)
- No external dependencies

### 4. Structured Logging
All logs are JSON objects with:
- `level`: DEBUG, INFO, WARN, ERROR
- `message`: Human-readable description
- `timestamp`: ISO 8601 format
- Additional context fields

Example:
```json
{
  "level": "INFO",
  "message": "Assessment request received",
  "enterprise_id": "FARM-001",
  "region": "East",
  "crop_type": "Rice",
  "timestamp": "2026-04-07T10:23:45.123Z"
}
```

### 5. Error Handling Strategy

| Scenario | HTTP Status | Response |
|----------|-------------|----------|
| Validation error | 422 | `{ "error": "Validation error", "details": [...] }` |
| ML service timeout | 503 | `{ "error": "ML service unavailable", "detail": "..." }` |
| ML service 4xx | Forward as-is | Forward response unchanged |
| ML service 5xx | 502 | `{ "error": "ML service error", "detail": "..." }` |
| Internal error | 500 | `{ "error": "Internal server error", "detail": "..." }` |

## Performance Characteristics

### Typical Request Timeline
```
0ms    - Request received
1ms    - Validation complete
2ms    - Derived fields computed
3ms    - External API calls start (parallel)
303ms  - All external APIs complete
304ms  - Payload assembled
305ms  - ML service request sent
2500ms - ML service response received
2501ms - Response sent to client
```

**Total:** ~2.5 seconds (dominated by ML inference time)

### Bottlenecks
1. ML microservice inference (~2s)
2. External API calls (~300ms in production, 1ms in dev)
3. Network latency to ngrok tunnel (~50-100ms)

### Optimization Opportunities
- Cache external API responses (by region/crop, TTL: 1 hour)
- Use HTTP/2 for ML service connection
- Implement request batching for multiple assessments

## Security Considerations

### Current Implementation
- ✅ CORS enabled (all origins in dev, restricted in prod)
- ✅ Request validation (prevent injection)
- ✅ Timeout on external calls (prevent hanging)
- ✅ Error messages don't leak sensitive info

### Production Recommendations
- Add rate limiting (e.g., 100 requests/minute per IP)
- Add authentication (API keys or JWT)
- Enable HTTPS only
- Add request size limits
- Implement audit logging
- Use environment-specific CORS origins

## Monitoring & Observability

### Logs to Monitor
- Request volume by endpoint
- Validation error rate
- External API failure rate
- ML service latency (p50, p95, p99)
- Error rate by type

### Metrics to Track
- Requests per second
- Average response time
- External API success rate
- ML service availability
- Memory usage
- CPU usage

### Alerts to Set Up
- ML service down (>5 consecutive failures)
- High error rate (>5% of requests)
- Slow response time (p95 > 10s)
- High memory usage (>80%)

## Deployment

### Environment Variables Required
```env
NGROK_URL=https://your-ml-service.ngrok-free.app
APP_ENV=production
PORT=8000
LOG_LEVEL=INFO
```

### Health Check
```bash
curl http://localhost:8000/api/v1/health
```

Expected response:
```json
{
  "status": "ok",
  "ngrok_url": "https://...",
  "env": "production"
}
```

### Scaling Considerations
- Stateless design → horizontal scaling friendly
- No database → no connection pool limits
- External API calls → consider rate limits
- ML service → single point of failure (consider load balancing)

## Future Enhancements

1. **Caching Layer**
   - Cache external API responses
   - Reduce latency by 300ms
   - Reduce external API load

2. **Batch Processing**
   - Accept multiple assessments in one request
   - Amortize ML service overhead

3. **Async Processing**
   - Return request ID immediately
   - Process in background
   - Poll for results

4. **Database Integration**
   - Store assessment history
   - Enable analytics
   - Support audit trails

5. **API Versioning**
   - Support multiple API versions
   - Gradual migration path
   - Backward compatibility
