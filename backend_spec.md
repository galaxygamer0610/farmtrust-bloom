# Backend Ingestion Spec — Farmer Credit & Subsidy Assessment System
> **Purpose:** This document is a complete, machine-readable specification for an LLM agent to generate a production-ready backend service. Read every section before generating any code. Do not skip or summarise sections.

---

## 1. System Overview

The backend receives farmer data submitted from a web form, enriches it by fetching values from external climate, market, and policy APIs, and forwards the complete assembled payload to a downstream ML microservice hosted on ngrok. The ML microservice returns a credit assessment result. The backend must **not** implement any ML logic itself — it is purely a data assembly and forwarding layer.

### Architecture Flow

```
[Web Form / Client]
        │
        │  POST /api/v1/assess
        │  (core farmer fields only)
        ▼
[Backend API Server]  ←── This is what you are generating
        │
        ├── Step 1: Validate & parse incoming farmer payload
        │
        ├── Step 2: Auto-compute derived fields from farmer inputs
        │           (net_profit, debt_to_equity)
        │
        ├── Step 3: Fetch 7 external API values
        │           keyed on { region, crop_type }
        │           Sources: IMD, NDMA, AGMARKNET, Agri Ministry, Govt Policy DB
        │           (All simulated with realistic mock data in dev — see Section 5)
        │
        ├── Step 4: Assemble final 18-field payload
        │
        └── Step 5: POST assembled payload to ML microservice
                    URL: https://NGROK_PLACEHOLDER.ngrok-free.app/predict
                    Receive response, forward to client
```

---

## 2. Incoming Request — Farmer-Provided Fields

These are the **only** fields the client sends. The backend must accept exactly this schema on `POST /api/v1/assess`.

### 2.1 Core ML Fields (required for credit scoring)

| Field Name         | Type    | Constraints                                      | Notes                                                 |
|--------------------|---------|--------------------------------------------------|-------------------------------------------------------|
| `enterprise_size`  | string  | Enum: `"Small"`, `"Medium"`, `"Large"`           | Required                                              |
| `region`           | string  | Enum: `"North"`, `"South"`, `"East"`, `"West"`   | Required. Used as API lookup key                      |
| `quarter`          | string  | Enum: `"Q1"`, `"Q2"`, `"Q3"`, `"Q4"`            | Required                                              |
| `annual_revenue`   | float   | > 0, in ₹ thousands                              | Required                                              |
| `annual_expenses`  | float   | >= 0, in ₹ thousands                             | Required                                              |
| `loan_amount`      | float   | >= 0, in ₹ thousands                             | Required                                              |
| `net_profit`       | float   | Can be negative, in ₹ thousands                  | Optional — auto-computed as `annual_revenue - annual_expenses` if not provided |
| `debt_to_equity`   | float   | >= 0                                             | Optional — auto-computed as `loan_amount / (annual_revenue * 2)` if not provided |

### 2.2 Subsidy Matcher Fields (required for subsidy matching, not used in ML credit model)

| Field Name          | Type   | Constraints                                                                                   | Notes    |
|---------------------|--------|-----------------------------------------------------------------------------------------------|----------|
| `landholding_size`  | float  | > 0, in acres                                                                                 | Required |
| `crop_type`         | string | Enum: `"Wheat"`, `"Rice"`, `"Cotton"`, `"Maize"`, `"Pulses"`, `"Vegetables"`, `"Groundnut"` | Required. Also used as API lookup key |
| `irrigation_type`   | string | Enum: `"Rainfed"`, `"Canal"`, `"Borewell"`, `"Sprinkler"`, `"Drip"`                          | Required |

### 2.3 Optional Metadata

| Field Name      | Type   | Notes                                      |
|-----------------|--------|--------------------------------------------|
| `enterprise_id` | string | Optional client-provided ID. Default: auto-generate UUID if absent |

### 2.4 Full Example Incoming Request Body

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

> `net_profit` and `debt_to_equity` are omitted — backend auto-computes them.

---

## 3. Auto-Computed Derived Fields

The backend must compute these **before** making any external API calls.

| Derived Field    | Formula                                           | Type  | Notes                                                                 |
|------------------|---------------------------------------------------|-------|-----------------------------------------------------------------------|
| `net_profit`     | `annual_revenue - annual_expenses`                | float | Only compute if not provided in request. Can be negative.            |
| `debt_to_equity` | `loan_amount / (annual_revenue * 2)`              | float | Only compute if not provided. Use `loan_amount / ((annual_revenue * 2) + 1e-6)` to avoid divide-by-zero. |

---

## 4. External API Fields — Auto-Fetched by Backend

The backend must fetch **all 7** of these values. They are never sent by the client. In production, each call hits a real external API. In development/testing, use the mock implementations specified in Section 5.

Every fetch must be wrapped in a try/except. On failure, fall back to the default value listed below — **do not raise an error to the client**.

### 4.1 IMD API — India Meteorological Department
**Lookup key:** `region`

| Field Name        | Type  | Description                          | Fallback Default |
|-------------------|-------|--------------------------------------|------------------|
| `avg_temperature` | float | Average temperature for region (°C)  | `25.0`           |
| `rainfall`        | float | Annual rainfall for region (mm)      | `200.0`          |

**Production endpoint (placeholder):**
```
GET https://api.imd.gov.in/v1/climate?region={region}
```
**Expected response shape:**
```json
{ "avg_temperature": 27.3, "rainfall": 1450.0 }
```

### 4.2 NDMA API — National Disaster Management Authority
**Lookup key:** `region`

| Field Name     | Type  | Description                        | Fallback Default |
|----------------|-------|------------------------------------|------------------|
| `drought_index` | float | Drought severity index [0.0, 1.0] | `0.5`            |
| `flood_risk`    | float | Flood risk score [0.0, 1.0]       | `0.5`            |

**Production endpoint (placeholder):**
```
GET https://api.ndma.gov.in/v1/risk?region={region}
```
**Expected response shape:**
```json
{ "drought_index": 0.62, "flood_risk": 0.34 }
```

### 4.3 AGMARKNET API — Agricultural Market Network
**Lookup key:** `region` + `crop_type`

| Field Name              | Type  | Description                              | Fallback Default |
|-------------------------|-------|------------------------------------------|------------------|
| `commodity_price_index` | float | Market commodity price index for crop   | `100.0`          |

**Production endpoint (placeholder):**
```
GET https://api.agmarknet.gov.in/v1/price?region={region}&crop={crop_type}
```
**Expected response shape:**
```json
{ "commodity_price_index": 118.5 }
```

### 4.4 Agri Ministry API — Ministry of Agriculture
**Lookup key:** `region`

| Field Name        | Type  | Description                                  | Fallback Default |
|-------------------|-------|----------------------------------------------|------------------|
| `input_cost_index` | float | Agricultural input cost index for region    | `100.0`          |

**Production endpoint (placeholder):**
```
GET https://api.agricoop.gov.in/v1/inputcost?region={region}
```
**Expected response shape:**
```json
{ "input_cost_index": 96.2 }
```

### 4.5 Government Policy Database
**Lookup key:** `region`

| Field Name             | Type | Description                                        | Fallback Default |
|------------------------|------|----------------------------------------------------|------------------|
| `policy_support_score` | int  | Policy support level for region. Integer [1, 4].  | `2`              |

**Production endpoint (placeholder):**
```
GET https://api.agricoop.gov.in/v1/policy?region={region}
```
**Expected response shape:**
```json
{ "policy_support_score": 3 }
```

---

## 5. Mock API Implementations (Development / Testing)

When `APP_ENV=development` or when any external API call fails, use the following lookup tables. These are derived from the training dataset's regional statistics and must be accurate — do not use random values.

### 5.1 IMD Mock Data (keyed by region)

```python
IMD_MOCK = {
    "North": {"avg_temperature": 22.4, "rainfall": 210.0},
    "South": {"avg_temperature": 28.7, "rainfall": 1850.0},
    "East":  {"avg_temperature": 27.1, "rainfall": 1420.0},
    "West":  {"avg_temperature": 25.8, "rainfall": 680.0},
}
```

### 5.2 NDMA Mock Data (keyed by region)

```python
NDMA_MOCK = {
    "North": {"drought_index": 0.38, "flood_risk": 0.22},
    "South": {"drought_index": 0.45, "flood_risk": 0.55},
    "East":  {"drought_index": 0.30, "flood_risk": 0.70},
    "West":  {"drought_index": 0.72, "flood_risk": 0.18},
}
```

### 5.3 AGMARKNET Mock Data (keyed by crop_type)

```python
AGMARKNET_MOCK = {
    "Wheat":      {"commodity_price_index": 124.0},
    "Rice":       {"commodity_price_index": 118.5},
    "Cotton":     {"commodity_price_index": 132.0},
    "Maize":      {"commodity_price_index": 108.0},
    "Pulses":     {"commodity_price_index": 141.0},
    "Vegetables": {"commodity_price_index": 95.0},
    "Groundnut":  {"commodity_price_index": 127.0},
}
```

### 5.4 Agri Ministry Mock Data (keyed by region)

```python
INPUT_COST_MOCK = {
    "North": {"input_cost_index": 98.0},
    "South": {"input_cost_index": 104.0},
    "East":  {"input_cost_index": 92.0},
    "West":  {"input_cost_index": 101.0},
}
```

### 5.5 Policy Score Mock Data (keyed by region)

```python
POLICY_MOCK = {
    "North": {"policy_support_score": 3},
    "South": {"policy_support_score": 2},
    "East":  {"policy_support_score": 2},
    "West":  {"policy_support_score": 4},
}
```

---

## 6. Assembled Payload — Sent to ML Microservice

After Steps 1–4, assemble a single flat JSON object containing **all 18 fields** listed below. This is the exact body of the POST request to the ML microservice.

### 6.1 Complete Payload Schema

| Field Name              | Source                    | Type   | Example Value  |
|-------------------------|---------------------------|--------|----------------|
| `enterprise_id`         | Request / auto-generated  | string | `"FARM-001"`   |
| `enterprise_size`       | Farmer input              | string | `"Small"`      |
| `region`                | Farmer input              | string | `"East"`       |
| `quarter`               | Farmer input              | string | `"Q2"`         |
| `annual_revenue`        | Farmer input              | float  | `280.0`        |
| `annual_expenses`       | Farmer input              | float  | `195.0`        |
| `loan_amount`           | Farmer input              | float  | `120.0`        |
| `net_profit`            | Auto-computed             | float  | `85.0`         |
| `debt_to_equity`        | Auto-computed             | float  | `0.214`        |
| `avg_temperature`       | IMD API                   | float  | `27.1`         |
| `rainfall`              | IMD API                   | float  | `1420.0`       |
| `drought_index`         | NDMA API                  | float  | `0.30`         |
| `flood_risk`            | NDMA API                  | float  | `0.70`         |
| `commodity_price_index` | AGMARKNET API             | float  | `118.5`        |
| `input_cost_index`      | Agri Ministry API         | float  | `92.0`         |
| `policy_support_score`  | Govt Policy DB            | int    | `2`            |
| `landholding_size`      | Farmer input              | float  | `1.5`          |
| `crop_type`             | Farmer input              | string | `"Rice"`       |
| `irrigation_type`       | Farmer input              | string | `"Rainfed"`    |

> Note: `irrigation_type`, `landholding_size`, and `crop_type` are included in the payload because the ML microservice runs both the credit model and the subsidy matcher internally.

### 6.2 Full Example Assembled Payload

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

---

## 7. ML Microservice — Forwarding Spec

### 7.1 Endpoint

```
POST https://NGROK_PLACEHOLDER.ngrok-free.app/predict
```

> The string `NGROK_PLACEHOLDER` must be replaced at runtime via environment variable `NGROK_URL`. The backend must read this from config — never hardcode it.

**Config key:** `NGROK_URL`
**Example env value:** `https://abc123.ngrok-free.app`
**Constructed endpoint:** `{NGROK_URL}/predict`

### 7.2 Request

- Method: `POST`
- Content-Type: `application/json`
- Body: the 18-field assembled payload from Section 6.2
- Timeout: 30 seconds

### 7.3 Expected ML Microservice Response

The ML microservice returns this JSON structure. The backend must forward it **unchanged** to the client:

```json
{
  "enterprise_id": "FARM-001",
  "probability_of_default": 0.3142,
  "credit_score": 68.58,
  "risk_category": "Medium Risk",
  "lending_recommendation": "Conditional — reduced amount or additional review",
  "top_features": [
    {
      "label": "Expense/Revenue Ratio",
      "value": 0.696,
      "importance": 18.4
    },
    {
      "label": "Net Profit Margin",
      "value": 0.304,
      "importance": 14.2
    }
  ],
  "eligible_subsidies": [
    {
      "scheme_id": "SS001",
      "scheme_name": "PM Fasal Bima Yojana (PMFBY)",
      "benefits": "Up to ₹2 lakh crop loss compensation.",
      "match_score": 1.0
    }
  ],
  "model_version": "1.0-XGB",
  "assessed_at": "2026-04-07T10:23:45.123Z"
}
```

### 7.4 Error Handling for ML Service

| Scenario                        | Backend Behaviour                                                                 |
|---------------------------------|-----------------------------------------------------------------------------------|
| ML service unreachable (timeout) | Return HTTP 503 with `{ "error": "ML service unavailable", "detail": "..." }` |
| ML service returns 4xx           | Forward status code and body unchanged to client                                 |
| ML service returns 5xx           | Return HTTP 502 with `{ "error": "ML service error", "detail": "..." }`        |
| ML service response malformed    | Return HTTP 502 with `{ "error": "Invalid response from ML service" }`         |

---

## 8. Backend API Specification

### 8.1 Endpoints to Implement

#### `POST /api/v1/assess`
Primary endpoint. Accepts farmer form submission, runs Steps 1–5, returns ML result.

- **Request body:** Section 2 fields (application/json)
- **Response 200:** ML microservice response (Section 7.3)
- **Response 422:** Validation error — missing required fields or invalid enum values
- **Response 503:** ML microservice unreachable
- **Processing time:** Target < 5s (external API calls are the bottleneck)

#### `GET /api/v1/health`
Health check endpoint.
- **Response 200:**
```json
{ "status": "ok", "ngrok_url": "https://abc123.ngrok-free.app", "env": "development" }
```

#### `GET /api/v1/config/enums`
Returns valid enum values for frontend dropdowns. Useful for keeping frontend and backend in sync.
- **Response 200:**
```json
{
  "enterprise_size": ["Small", "Medium", "Large"],
  "region": ["North", "South", "East", "West"],
  "quarter": ["Q1", "Q2", "Q3", "Q4"],
  "crop_type": ["Wheat", "Rice", "Cotton", "Maize", "Pulses", "Vegetables", "Groundnut"],
  "irrigation_type": ["Rainfed", "Canal", "Borewell", "Sprinkler", "Drip"]
}
```

### 8.2 CORS

Enable CORS for all origins in development (`*`). In production, restrict to the frontend domain.

### 8.3 Logging

Log the following at each stage (structured JSON logs preferred):

- Incoming request received (log enterprise_id, timestamp)
- Auto-computed fields (log net_profit, debt_to_equity)
- Each external API call result or fallback used (log source, field, value, used_mock: true/false)
- Assembled payload sent to ML service (full payload at DEBUG level)
- ML service response received (log credit_score, risk_category, latency_ms)
- Final response sent to client

---

## 9. Environment Variables

The backend must read all configurable values from environment variables. Provide a `.env.example` file.

| Variable          | Description                                           | Example Value                          |
|-------------------|-------------------------------------------------------|----------------------------------------|
| `NGROK_URL`       | Base URL of the ngrok-tunnelled ML microservice       | `https://abc123.ngrok-free.app`        |
| `APP_ENV`         | Runtime environment                                   | `development` or `production`          |
| `PORT`            | Port the backend listens on                           | `8000`                                 |
| `IMD_API_URL`     | IMD API base URL (production)                         | `https://api.imd.gov.in/v1`            |
| `NDMA_API_URL`    | NDMA API base URL (production)                        | `https://api.ndma.gov.in/v1`           |
| `AGMARKNET_URL`   | AGMARKNET API base URL (production)                   | `https://api.agmarknet.gov.in/v1`      |
| `AGRIMIN_URL`     | Agri Ministry API base URL (production)               | `https://api.agricoop.gov.in/v1`       |
| `LOG_LEVEL`       | Logging verbosity                                     | `INFO` or `DEBUG`                      |

> When `APP_ENV=development`, all 5 external API calls must use the mock lookup tables from Section 5 without making any real HTTP requests.

---

## 10. Technology Stack Recommendation

Generate the backend using **FastAPI** (Python). Use the following libraries:

| Library       | Purpose                                      |
|---------------|----------------------------------------------|
| `fastapi`     | API framework                                |
| `uvicorn`     | ASGI server                                  |
| `httpx`       | Async HTTP client for external API calls     |
| `pydantic`    | Request/response validation and schemas      |
| `python-dotenv` | Environment variable loading               |
| `uuid`        | Auto-generating enterprise_id when absent    |

All external API fetches in Step 3 must be made **concurrently** using `asyncio.gather` — not sequentially. Total latency for the 5 external calls should be the max of individual call times, not their sum.

---

## 11. Pydantic Schemas (Reference)

### 11.1 Incoming Request Schema

```python
from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum

class EnterpriseSize(str, Enum):
    small = "Small"
    medium = "Medium"
    large = "Large"

class Region(str, Enum):
    north = "North"
    south = "South"
    east = "East"
    west = "West"

class Quarter(str, Enum):
    q1 = "Q1"
    q2 = "Q2"
    q3 = "Q3"
    q4 = "Q4"

class CropType(str, Enum):
    wheat = "Wheat"
    rice = "Rice"
    cotton = "Cotton"
    maize = "Maize"
    pulses = "Pulses"
    vegetables = "Vegetables"
    groundnut = "Groundnut"

class IrrigationType(str, Enum):
    rainfed = "Rainfed"
    canal = "Canal"
    borewell = "Borewell"
    sprinkler = "Sprinkler"
    drip = "Drip"

class FarmerAssessmentRequest(BaseModel):
    enterprise_id: Optional[str] = None
    enterprise_size: EnterpriseSize
    region: Region
    quarter: Quarter
    annual_revenue: float = Field(..., gt=0, description="Annual revenue in ₹ thousands")
    annual_expenses: float = Field(..., ge=0, description="Annual expenses in ₹ thousands")
    loan_amount: float = Field(..., ge=0, description="Outstanding loan in ₹ thousands")
    net_profit: Optional[float] = None
    debt_to_equity: Optional[float] = None
    landholding_size: float = Field(..., gt=0, description="Land in acres")
    crop_type: CropType
    irrigation_type: IrrigationType
```

### 11.2 Assembled ML Payload Schema

```python
class MLPayload(BaseModel):
    enterprise_id: str
    enterprise_size: str
    region: str
    quarter: str
    annual_revenue: float
    annual_expenses: float
    loan_amount: float
    net_profit: float
    debt_to_equity: float
    avg_temperature: float
    rainfall: float
    drought_index: float
    flood_risk: float
    commodity_price_index: float
    input_cost_index: float
    policy_support_score: int
    landholding_size: float
    crop_type: str
    irrigation_type: str
```

---

## 12. Processing Logic — Step-by-Step (Pseudocode)

```
async function handle_assess_request(request):

    # Step 1 — Parse & validate
    data = validate(request.body)  # pydantic raises 422 on failure
    enterprise_id = data.enterprise_id OR generate_uuid()

    # Step 2 — Auto-compute derived fields
    net_profit = data.net_profit IF provided ELSE (data.annual_revenue - data.annual_expenses)
    debt_to_equity = data.debt_to_equity IF provided ELSE (data.loan_amount / (data.annual_revenue * 2 + 1e-6))

    # Step 3 — Fetch external API fields (all concurrent)
    [imd_data, ndma_data, agmark_data, agri_data, policy_data] = await gather(
        fetch_imd(region=data.region),
        fetch_ndma(region=data.region),
        fetch_agmarknet(region=data.region, crop=data.crop_type),
        fetch_agri_ministry(region=data.region),
        fetch_policy(region=data.region),
    )

    # Step 4 — Assemble payload
    ml_payload = {
        enterprise_id, enterprise_size, region, quarter,
        annual_revenue, annual_expenses, loan_amount,
        net_profit, debt_to_equity,
        avg_temperature   = imd_data.avg_temperature,
        rainfall          = imd_data.rainfall,
        drought_index     = ndma_data.drought_index,
        flood_risk        = ndma_data.flood_risk,
        commodity_price_index = agmark_data.commodity_price_index,
        input_cost_index  = agri_data.input_cost_index,
        policy_support_score = policy_data.policy_support_score,
        landholding_size, crop_type, irrigation_type,
    }

    # Step 5 — Forward to ML microservice
    ngrok_endpoint = env.NGROK_URL + "/predict"
    response = await http_post(ngrok_endpoint, json=ml_payload, timeout=30)

    return response.json()
```

---

## 13. Feature Engineering Context (Do Not Implement — For Agent Awareness Only)

The ML microservice handles all feature engineering internally. The backend sends raw values only. For agent awareness, here is what the microservice computes from the 18-field payload before running the XGBoost model:

| Engineered Feature      | Formula                                             | Clip Range   |
|-------------------------|-----------------------------------------------------|--------------|
| ERR (expense ratio)     | `annual_expenses / annual_revenue`                  | [0, 3]       |
| DSR (debt ratio)        | `loan_amount / annual_revenue`                      | [0, 5]       |
| NPM (profit margin)     | `net_profit / annual_revenue`                       | [−2, 1]      |
| DE_ratio                | `debt_to_equity`                                    | [0, 5]       |
| CRI (climate resilience)| `0.40×rain_norm − 0.35×drought − 0.25×flood + 0.35`| [0, 1]       |
| TSI (temp stress)       | `abs(avg_temperature − 23.5) / 10`                  | [0, 1]       |
| MRI (market risk)       | `commodity_price_index / input_cost_index`          | [0.3, 3.0]   |
| enterprise_enc          | Small=0, Medium=1, Large=2                          | ordinal      |
| quarter_enc             | Q1=0, Q2=1, Q3=2, Q4=3                             | ordinal      |
| policy_norm             | min-max normalised policy_support_score             | [0, 1]       |
| financial_stability     | `1 − ERR / 2`                                       | [0, 1]       |
| leverage_risk           | `DE_ratio / 5`                                      | [0, 1]       |
| repayment_capacity      | `NPM / 2 + 0.5`                                     | [0, 1]       |
| region_North            | 1 if region == "North" else 0                       | OHE          |
| region_South            | 1 if region == "South" else 0                       | OHE          |
| region_West             | 1 if region == "West" else 0                        | OHE          |

Total model features: 27 (11 raw numeric + 13 engineered + 3 region OHE). East is the dropped OHE baseline.

---

## 14. File Structure to Generate

```
backend/
├── main.py                  # FastAPI app, route definitions
├── schemas.py               # All Pydantic models (Section 11)
├── config.py                # Env var loading, app settings
├── services/
│   ├── api_fetcher.py       # All 5 external API fetch functions + mock tables
│   ├── assembler.py         # Payload assembly logic (Steps 2–4)
│   └── ml_client.py        # HTTP client for ML microservice (Step 5)
├── routers/
│   └── assess.py            # /api/v1/assess and supporting routes
├── requirements.txt
└── .env.example
```

---

## 15. Critical Implementation Rules

1. **All external API calls must be async and concurrent** — use `asyncio.gather`. Never use synchronous `requests` library.
2. **Never raise an error to the client due to an external API failure** — always fall back to defaults from Section 5 and log a warning.
3. **NGROK_URL must come from environment** — never hardcode any ngrok URL in source code.
4. **When `APP_ENV=development`**, skip all real HTTP calls to external APIs and use mock data from Section 5 directly.
5. **net_profit and debt_to_equity** — always recompute if not provided; do not pass `null` to the ML service.
6. **enterprise_id** — auto-generate a UUID4 string if the client does not provide one.
7. **The ML payload must contain exactly the 18 fields in Section 6.1** — no more, no less.
8. **Forward the ML microservice response unchanged** — do not modify, reformat, or add fields to it.
9. **Use Pydantic enums for all string fields** — reject any value not in the allowed enum set with a 422.
10. **Timeout on ML service call is 30 seconds** — return 503 if exceeded.
