# 🔄 Backend Flow Diagram

## Visual Guide to How Everything Works

---

## 📊 Overall System Architecture

```
┌─────────────────┐
│   Web Browser   │
│  (Farmer Form)  │
└────────┬────────┘
         │ POST /api/v1/assess
         │ { farmer data }
         ▼
┌─────────────────────────────────────────────────────────┐
│                    OUR BACKEND                          │
│                  (Node.js + Express)                    │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Step 1: VALIDATE                                │  │
│  │  ✓ Check required fields                         │  │
│  │  ✓ Check enum values                             │  │
│  │  ✓ Check numeric constraints                     │  │
│  └──────────────────────────────────────────────────┘  │
│                        │                                │
│                        ▼                                │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Step 2: COMPUTE DERIVED FIELDS                  │  │
│  │  • net_profit = revenue - expenses               │  │
│  │  • debt_to_equity = loan / (revenue × 2)         │  │
│  └──────────────────────────────────────────────────┘  │
│                        │                                │
│                        ▼                                │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Step 3: FETCH EXTERNAL DATA (Concurrent!)       │  │
│  │                                                   │  │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐          │  │
│  │  │   IMD   │  │  NDMA   │  │AGMARKNET│          │  │
│  │  │ Weather │  │Disaster │  │  Price  │          │  │
│  │  └─────────┘  └─────────┘  └─────────┘          │  │
│  │       ▲            ▲            ▲                 │  │
│  │       └────────────┴────────────┘                 │  │
│  │  ┌─────────┐  ┌─────────┐                        │  │
│  │  │  Agri   │  │ Policy  │                        │  │
│  │  │Ministry │  │   DB    │                        │  │
│  │  └─────────┘  └─────────┘                        │  │
│  │       ▲            ▲                              │  │
│  │       └────────────┘                              │  │
│  │  All 5 APIs called at the SAME TIME!             │  │
│  └──────────────────────────────────────────────────┘  │
│                        │                                │
│                        ▼                                │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Step 4: ASSEMBLE PAYLOAD                        │  │
│  │  Combine: Farmer + Derived + External = 18 fields│  │
│  └──────────────────────────────────────────────────┘  │
│                        │                                │
│                        ▼                                │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Step 5: SEND TO ML SERVICE                      │  │
│  │  POST to ngrok URL                               │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │   ML Microservice      │
         │   (Python/FastAPI)     │
         │   via ngrok            │
         └────────────┬───────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │  Credit Score Result   │
         │  • Score: 68.58        │
         │  • Risk: Medium        │
         │  • Subsidies: [...]    │
         └────────────┬───────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │   Back to Browser      │
         └────────────────────────┘
```

---

## 🗂️ File Structure & Responsibilities

```
backend/
│
├── server.js  ◄─────────────────────┐
│   │                                │
│   ├─ Creates Express app           │  ENTRY POINT
│   ├─ Sets up middleware            │  Starts everything
│   ├─ Connects routes               │
│   └─ Starts listening on port 8000 │
│                                     │
├── config/                           │
│   └── config.js  ◄──────────────────┤
│       │                             │  CONFIGURATION
│       └─ Loads .env variables       │  Settings & URLs
│                                     │
├── routes/                           │
│   └── assess.js  ◄──────────────────┤
│       │                             │  ROUTING
│       ├─ GET  /health               │  URL → Function
│       ├─ GET  /config/enums         │
│       └─ POST /assess               │
│                                     │
├── utils/                            │
│   ├── validation.js  ◄──────────────┤
│   │   │                             │  VALIDATION
│   │   └─ Checks if data is valid   │  Input checking
│   │                                 │
│   └── logger.js  ◄──────────────────┤
│       │                             │  LOGGING
│       └─ Logs events & errors       │  Debugging
│                                     │
└── services/                         │
    │                                 │
    ├── apiFetcher.js  ◄──────────────┤
    │   │                             │  EXTERNAL APIs
    │   ├─ fetchIMD()                 │  Get external data
    │   ├─ fetchNDMA()                │
    │   ├─ fetchAgmarknet()           │
    │   ├─ fetchAgriMinistry()        │
    │   └─ fetchPolicy()              │
    │                                 │
    ├── mockData.js  ◄────────────────┤
    │   │                             │  MOCK DATA
    │   └─ Fake data for testing     │  Development mode
    │                                 │
    ├── assembler.js  ◄───────────────┤
    │   │                             │  DATA ASSEMBLY
    │   ├─ computeDerivedFields()    │  Combine everything
    │   └─ assemblePayload()          │
    │                                 │
    └── mlClient.js  ◄────────────────┘
        │                               ML INTEGRATION
        └─ callMLService()              Talk to ML service
```

---

## 🔄 Request Flow (Step by Step)

### Example: Farmer submits assessment form

```
TIME: 0ms
┌─────────────────────────────────────────────────────────┐
│ 1. REQUEST ARRIVES                                      │
│                                                         │
│ POST http://localhost:8000/api/v1/assess               │
│ Content-Type: application/json                         │
│                                                         │
│ Body:                                                   │
│ {                                                       │
│   "enterprise_size": "Small",                           │
│   "region": "East",                                     │
│   "quarter": "Q2",                                      │
│   "annual_revenue": 280.0,                              │
│   "annual_expenses": 195.0,                             │
│   "loan_amount": 120.0,                                 │
│   "landholding_size": 1.5,                              │
│   "crop_type": "Rice",                                  │
│   "irrigation_type": "Rainfed"                          │
│ }                                                       │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
TIME: 1ms
┌─────────────────────────────────────────────────────────┐
│ 2. MIDDLEWARE PROCESSING                                │
│                                                         │
│ ✓ CORS middleware: Allow cross-origin                  │
│ ✓ JSON parser: Parse body into JavaScript object       │
│ ✓ Logger: Log incoming request                         │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
TIME: 2ms
┌─────────────────────────────────────────────────────────┐
│ 3. ROUTE MATCHING                                       │
│                                                         │
│ Express finds: router.post('/assess', ...)             │
│ Calls: assess.js handler function                      │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
TIME: 3ms
┌─────────────────────────────────────────────────────────┐
│ 4. VALIDATION (validation.js)                           │
│                                                         │
│ Check: enterprise_size present? ✓                      │
│ Check: enterprise_size in [Small,Medium,Large]? ✓      │
│ Check: region present? ✓                               │
│ Check: region in [North,South,East,West]? ✓            │
│ Check: annual_revenue > 0? ✓                           │
│ ... (all fields checked)                               │
│                                                         │
│ Result: VALID ✓                                         │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
TIME: 4ms
┌─────────────────────────────────────────────────────────┐
│ 5. COMPUTE DERIVED FIELDS (assembler.js)               │
│                                                         │
│ net_profit = 280.0 - 195.0 = 85.0                      │
│ debt_to_equity = 120.0 / (280.0 × 2) = 0.214          │
│                                                         │
│ Log: "Derived fields computed"                         │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
TIME: 5ms
┌─────────────────────────────────────────────────────────┐
│ 6. FETCH EXTERNAL DATA (apiFetcher.js)                 │
│                                                         │
│ Promise.all([  ← All 5 run at the SAME TIME!          │
│   fetchIMD("East"),                                     │
│   fetchNDMA("East"),                                    │
│   fetchAgmarknet("East", "Rice"),                       │
│   fetchAgriMinistry("East"),                            │
│   fetchPolicy("East")                                   │
│ ])                                                      │
│                                                         │
│ In DEV mode: Uses mock data (instant)                  │
│ In PROD mode: Real API calls (500ms each, concurrent)  │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
TIME: 10ms (dev) / 500ms (prod)
┌─────────────────────────────────────────────────────────┐
│ 7. EXTERNAL DATA RECEIVED                               │
│                                                         │
│ IMD:       { avg_temperature: 27.1, rainfall: 1420.0 } │
│ NDMA:      { drought_index: 0.30, flood_risk: 0.70 }   │
│ AGMARKNET: { commodity_price_index: 118.5 }            │
│ Agri Min:  { input_cost_index: 92.0 }                  │
│ Policy:    { policy_support_score: 2 }                 │
│                                                         │
│ Log: "All external API calls completed"                │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
TIME: 11ms
┌─────────────────────────────────────────────────────────┐
│ 8. ASSEMBLE COMPLETE PAYLOAD (assembler.js)            │
│                                                         │
│ Combine:                                                │
│ • Farmer input (9 fields)                              │
│ • Derived fields (2 fields)                            │
│ • External data (7 fields)                             │
│ = 18 fields total                                      │
│                                                         │
│ {                                                       │
│   "enterprise_id": "FARM-001",                          │
│   "enterprise_size": "Small",                           │
│   "region": "East",                                     │
│   "quarter": "Q2",                                      │
│   "annual_revenue": 280.0,                              │
│   "annual_expenses": 195.0,                             │
│   "loan_amount": 120.0,                                 │
│   "net_profit": 85.0,              ← Computed          │
│   "debt_to_equity": 0.214,         ← Computed          │
│   "avg_temperature": 27.1,         ← From IMD          │
│   "rainfall": 1420.0,              ← From IMD          │
│   "drought_index": 0.30,           ← From NDMA         │
│   "flood_risk": 0.70,              ← From NDMA         │
│   "commodity_price_index": 118.5,  ← From AGMARKNET   │
│   "input_cost_index": 92.0,        ← From Agri Min    │
│   "policy_support_score": 2,       ← From Policy      │
│   "landholding_size": 1.5,                             │
│   "crop_type": "Rice",                                  │
│   "irrigation_type": "Rainfed"                          │
│ }                                                       │
│                                                         │
│ Log: "Payload assembled"                               │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
TIME: 12ms
┌─────────────────────────────────────────────────────────┐
│ 9. SEND TO ML SERVICE (mlClient.js)                    │
│                                                         │
│ POST https://abc123.ngrok-free.app/predict             │
│ Timeout: 30 seconds                                     │
│ Body: { ...18 fields... }                              │
│                                                         │
│ Log: "Sending request to ML microservice"              │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
TIME: 12ms - 30s (waiting for ML service)
┌─────────────────────────────────────────────────────────┐
│ 10. ML SERVICE PROCESSES                                │
│                                                         │
│ ML Service:                                             │
│ • Receives 18 fields                                   │
│ • Runs feature engineering                             │
│ • Runs XGBoost model                                   │
│ • Matches subsidies                                    │
│ • Returns result                                       │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
TIME: ~2s (typical ML processing time)
┌─────────────────────────────────────────────────────────┐
│ 11. ML RESPONSE RECEIVED                                │
│                                                         │
│ {                                                       │
│   "enterprise_id": "FARM-001",                          │
│   "probability_of_default": 0.3142,                     │
│   "credit_score": 68.58,                                │
│   "risk_category": "Medium Risk",                       │
│   "lending_recommendation": "Conditional",              │
│   "top_features": [...],                                │
│   "eligible_subsidies": [...],                          │
│   "model_version": "1.0-XGB",                           │
│   "assessed_at": "2026-04-10T10:23:45.123Z"            │
│ }                                                       │
│                                                         │
│ Log: "ML microservice response received"               │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
TIME: ~2s
┌─────────────────────────────────────────────────────────┐
│ 12. SEND RESPONSE TO CLIENT                             │
│                                                         │
│ HTTP 200 OK                                             │
│ Content-Type: application/json                         │
│                                                         │
│ Body: { ...ML response unchanged... }                  │
│                                                         │
│ Log: "Assessment completed successfully"               │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
                  ┌─────────┐
                  │ Browser │
                  │ receives│
                  │ result  │
                  └─────────┘
```

---

## 🚨 Error Flow Examples

### Example 1: Validation Error

```
Request: { "region": "Invalid" }  ← Bad value
         │
         ▼
    Validation
         │
         ▼
    ❌ FAIL: "region must be one of: North, South, East, West"
         │
         ▼
    HTTP 422 Unprocessable Entity
    {
      "error": "Validation error",
      "details": ["region must be one of: North, South, East, West"]
    }
```

### Example 2: ML Service Timeout

```
Request arrives
         │
         ▼
    Validation ✓
         │
         ▼
    Compute derived ✓
         │
         ▼
    Fetch external ✓
         │
         ▼
    Assemble payload ✓
         │
         ▼
    Call ML service...
         │
         ▼
    ⏱️ Wait 30 seconds...
         │
         ▼
    ❌ TIMEOUT
         │
         ▼
    HTTP 503 Service Unavailable
    {
      "error": "ML service unavailable",
      "detail": "Request timed out after 30 seconds"
    }
```

### Example 3: External API Failure (Graceful Fallback)

```
Fetch IMD API
         │
         ▼
    ❌ Network error
         │
         ▼
    ⚠️ Use fallback: { avg_temperature: 25.0, rainfall: 200.0 }
         │
         ▼
    Log: "IMD API call failed, using fallback"
         │
         ▼
    ✓ Continue processing (no error to client!)
```

---

## 🎯 Key Concepts Visualized

### Synchronous vs Asynchronous

```
SYNCHRONOUS (Slow - 2.5 seconds total):
┌─────────┐
│ Fetch A │ ─── 500ms ───┐
└─────────┘               │
                          ▼
                    ┌─────────┐
                    │ Fetch B │ ─── 500ms ───┐
                    └─────────┘               │
                                              ▼
                                        ┌─────────┐
                                        │ Fetch C │ ─── 500ms ───┐
                                        └─────────┘               │
                                                                  ▼
                                                            ┌─────────┐
                                                            │ Fetch D │ ─── 500ms ───┐
                                                            └─────────┘               │
                                                                                      ▼
                                                                                ┌─────────┐
                                                                                │ Fetch E │ ─── 500ms
                                                                                └─────────┘

ASYNCHRONOUS (Fast - 500ms total):
┌─────────┐
│ Fetch A │ ─── 500ms ───┐
└─────────┘               │
┌─────────┐               │
│ Fetch B │ ─── 500ms ───┤
└─────────┘               │
┌─────────┐               ├──▶ All done!
│ Fetch C │ ─── 500ms ───┤
└─────────┘               │
┌─────────┐               │
│ Fetch D │ ─── 500ms ───┤
└─────────┘               │
┌─────────┐               │
│ Fetch E │ ─── 500ms ───┘
└─────────┘

We use Promise.all() to run all 5 API calls at the same time!
```

### Middleware Chain

```
Request
   │
   ▼
┌──────────────┐
│ CORS         │ ← Allow cross-origin requests
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ JSON Parser  │ ← Parse request body
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Logger       │ ← Log the request
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Route Handler│ ← Your code runs here
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Error Handler│ ← Catch any errors
└──────┬───────┘
       │
       ▼
   Response
```

---

## 📚 Summary

This backend is a **data pipeline**:

1. **Receives** farmer data
2. **Validates** it
3. **Enriches** it with external data
4. **Forwards** it to ML service
5. **Returns** the credit score

Every step has error handling, logging, and fallbacks to ensure reliability!

---

**Next:** Read BEGINNER_GUIDE.md for detailed code explanations!
