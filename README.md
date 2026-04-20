# Farmer Credit & Subsidy Assessment Backend

Node.js backend service for the FarmTrust Bloom platform. This service receives farmer data, enriches it with external API data, and forwards it to an ML microservice for credit assessment.

## Architecture

```
[Web Form] → [Backend API] → [External APIs] → [ML Microservice (ngrok)]
                    ↓
              [Credit Score + Subsidies]
```

## Features

- ✅ Validates farmer input data
- ✅ Auto-computes derived financial metrics
- ✅ Fetches data from 5 external APIs concurrently
- ✅ Forwards complete payload to ML microservice
- ✅ Mock data support for development
- ✅ Comprehensive error handling and logging
- ✅ CORS enabled for frontend integration

## Installation

```bash
npm install
```

## Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NGROK_URL` | ML microservice ngrok URL | Yes |
| `APP_ENV` | Environment (development/production) | Yes |
| `PORT` | Server port | No (default: 8000) |
| `LOG_LEVEL` | Logging level (DEBUG/INFO/WARN/ERROR) | No (default: INFO) |

## Running the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:8000`

## API Endpoints

### POST /api/v1/assess
Main assessment endpoint. Accepts farmer data and returns credit assessment.

**Request Body:**
```json
{
  "enterprise_id": "FARM-001",
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

**Response (200):**
```json
{
  "enterprise_id": "FARM-001",
  "probability_of_default": 0.3142,
  "credit_score": 68.58,
  "risk_category": "Medium Risk",
  "lending_recommendation": "Conditional",
  "eligible_subsidies": [...],
  "model_version": "1.0-XGB",
  "assessed_at": "2026-04-07T10:23:45.123Z"
}
```

### GET /api/v1/health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "ngrok_url": "https://abc123.ngrok-free.app",
  "env": "development"
}
```

### GET /api/v1/config/enums
Returns valid enum values for frontend dropdowns.

**Response:**
```json
{
  "enterprise_size": ["Small", "Medium", "Large"],
  "region": ["North", "South", "East", "West"],
  "quarter": ["Q1", "Q2", "Q3", "Q4"],
  "crop_type": ["Wheat", "Rice", "Cotton", "Maize", "Pulses", "Vegetables", "Groundnut"],
  "irrigation_type": ["Rainfed", "Canal", "Borewell", "Sprinkler", "Drip"]
}
```

## Project Structure

```
backend/
├── config/
│   └── config.js           # Environment configuration
├── routes/
│   └── assess.js           # API route handlers
├── services/
│   ├── apiFetcher.js       # External API calls
│   ├── assembler.js        # Payload assembly
│   ├── mlClient.js         # ML microservice client
│   └── mockData.js         # Mock data for development
├── utils/
│   ├── logger.js           # Structured logging
│   └── validation.js       # Request validation
├── server.js               # Express app entry point
├── .env                    # Environment variables
├── .env.example            # Environment template
└── package.json
```

## Development Mode

In development (`APP_ENV=development`), the service uses mock data instead of calling real external APIs. This allows testing without external dependencies.

Mock data is based on actual training dataset statistics and includes:
- IMD climate data (temperature, rainfall)
- NDMA disaster risk data (drought, flood)
- AGMARKNET commodity prices
- Agriculture Ministry input costs
- Government policy support scores

## Testing with cURL

```bash
# Health check
curl http://localhost:8000/api/v1/health

# Get enum values
curl http://localhost:8000/api/v1/config/enums

# Submit assessment
curl -X POST http://localhost:8000/api/v1/assess \
  -H "Content-Type: application/json" \
  -d '{
    "enterprise_size": "Small",
    "region": "East",
    "quarter": "Q2",
    "annual_revenue": 280.0,
    "annual_expenses": 195.0,
    "loan_amount": 120.0,
    "landholding_size": 1.5,
    "crop_type": "Rice",
    "irrigation_type": "Rainfed"
  }'
```

## Exposing via ngrok

To expose this backend via ngrok:

```bash
# Install ngrok if not already installed
# Download from https://ngrok.com/download

# Start the backend
npm run dev

# In another terminal, expose port 8000
ngrok http 8000
```

Copy the ngrok URL and use it in your frontend configuration.

## Error Handling

The service handles errors gracefully:
- **422**: Validation errors (missing/invalid fields)
- **500**: Internal server errors
- **502**: ML service errors
- **503**: ML service unavailable/timeout

All errors are logged with structured JSON for easy debugging.

## Logging

Structured JSON logs include:
- Request received (enterprise_id, timestamp)
- Derived field computations
- External API calls (with fallback indicators)
- ML service requests/responses
- Error details with stack traces

Set `LOG_LEVEL=DEBUG` for verbose logging.

## Next Steps

1. Update `NGROK_URL` in `.env` with your ML microservice URL
2. Start the server: `npm run dev`
3. Test with the provided cURL commands
4. Integrate with your frontend application

## License

ISC
