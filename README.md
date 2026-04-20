# FarmTrust ML Microservice

FastAPI-based microservice for farmer credit assessment and subsidy matching.

## Overview

This microservice receives farmer data from the Node.js backend, processes it through the ML pipeline, and returns credit scores, risk assessments, and eligible subsidies.

## Architecture

```
Backend (Node.js) → POST /predict → Microservice (FastAPI) → ML Pipeline (Python) → Response
```

## Endpoints

### `POST /predict`
Main prediction endpoint that receives farmer data and returns credit assessment.

**Request Body:**
```json
{
  "enterprise_id": "FARM-12345-XYZ",
  "enterprise_size": "Small",
  "region": "West",
  "quarter": "Q2",
  "annual_revenue": 150.0,
  "annual_expenses": 120.0,
  "loan_amount": 50.0,
  "net_profit": 30.0,
  "debt_to_equity": 0.167,
  "avg_temperature": 25.0,
  "rainfall": 200.0,
  "drought_index": 0.3,
  "flood_risk": 0.2,
  "commodity_price_index": 105.0,
  "input_cost_index": 100.0,
  "policy_support_score": 2,
  "landholding_size": 2.5,
  "crop_type": "Wheat",
  "irrigation_type": "Canal",
  "yield_amount": 5.0
}
```

**Response:**
```json
{
  "enterprise_id": "FARM-12345-XYZ",
  "probability_of_default": 0.0001,
  "credit_score": 99.99,
  "risk_category": "Low Risk",
  "lending_recommendation": "Eligible - proceed with standard loan terms",
  "top_features": [
    {
      "label": "leverage_risk",
      "value": 0.033,
      "importance": 25.55
    }
  ],
  "eligible_subsidies": [
    {
      "scheme_id": "SS004",
      "scheme_name": "Per Drop More Crop",
      "benefits": "55% subsidy on Drip irrigation",
      "match_score": 1.0
    }
  ],
  "selected_model": "XGBoost",
  "model_version": "1.2-Dynamic-Matcher",
  "assessed_at": "2026-04-20T12:00:00.000Z"
}
```

### `GET /health`
Health check endpoint.

### `GET /model/info`
Get information about the loaded ML model.

### `GET /`
Root endpoint with service information.

## Setup

### Prerequisites
- Python 3.10+
- pip or conda

### Installation

1. **Create virtual environment:**
```bash
cd microservice
python -m venv venv
```

2. **Activate virtual environment:**

Windows:
```bash
venv\Scripts\activate
```

Linux/Mac:
```bash
source venv/bin/activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Configure environment:**
```bash
cp .env.example .env
# Edit .env if needed
```

### Running the Service

**Development mode (with auto-reload):**
```bash
python app.py
```

**Production mode:**
```bash
uvicorn app:app --host 0.0.0.0 --port 8000
```

The service will start on `http://localhost:8000`

### API Documentation

Once running, visit:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

## Testing

### Test with curl:
```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "enterprise_size": "Small",
    "region": "West",
    "quarter": "Q2",
    "annual_revenue": 150.0,
    "annual_expenses": 120.0,
    "loan_amount": 50.0,
    "net_profit": 30.0,
    "debt_to_equity": 0.167,
    "avg_temperature": 25.0,
    "rainfall": 200.0,
    "drought_index": 0.3,
    "flood_risk": 0.2,
    "commodity_price_index": 105.0,
    "input_cost_index": 100.0,
    "policy_support_score": 2,
    "landholding_size": 2.5,
    "crop_type": "Wheat",
    "irrigation_type": "Canal"
  }'
```

### Test with Python:
```python
import requests

url = "http://localhost:8000/predict"
data = {
    "enterprise_size": "Small",
    "region": "West",
    "quarter": "Q2",
    "annual_revenue": 150.0,
    "annual_expenses": 120.0,
    "loan_amount": 50.0,
    "net_profit": 30.0,
    "debt_to_equity": 0.167,
    "avg_temperature": 25.0,
    "rainfall": 200.0,
    "drought_index": 0.3,
    "flood_risk": 0.2,
    "commodity_price_index": 105.0,
    "input_cost_index": 100.0,
    "policy_support_score": 2,
    "landholding_size": 2.5,
    "crop_type": "Wheat",
    "irrigation_type": "Canal"
}

response = requests.post(url, json=data)
print(response.json())
```

## Connecting to Backend

### Update Backend Configuration

In `backend/.env`, set:
```
NGROK_URL=http://localhost:8000
```

Or if using ngrok:
```bash
ngrok http 8000
# Copy the ngrok URL (e.g., https://abc123.ngrok.io)
# Update backend/.env:
NGROK_URL=https://abc123.ngrok.io
```

### Test End-to-End

1. Start microservice: `python app.py`
2. Start backend: `cd backend && node server.js`
3. Send request to backend: `POST http://localhost:8000/api/v1/assess`

## Project Structure

```
microservice/
├── app.py              # Main FastAPI application
├── requirements.txt    # Python dependencies
├── .env               # Environment configuration
├── .env.example       # Example environment file
└── README.md          # This file
```

## Dependencies

The microservice uses the ML code from `../ml/pbl/`:
- `inference.py` - Main ML pipeline
- `credit_score.py` - Credit scoring model
- `feature_engineering.py` - Feature engineering
- `subsidy_matcher.py` - Subsidy matching
- `api_fetcher.py` - External API calls
- `xgboost_model.pkl` - Trained model

## Error Handling

The service handles:
- ✅ Validation errors (422)
- ✅ Model not found (500)
- ✅ Prediction errors (500)
- ✅ Timeout handling (30s from backend)

## Logging

Logs include:
- Request received with enterprise_id
- Prediction results (score, risk category)
- Errors with stack traces

## Performance

- Average response time: 200-500ms
- Timeout: 30 seconds (configured in backend)
- Concurrent requests: Handled by uvicorn workers

## Production Deployment

### Using Docker (Optional):
```dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Using systemd:
Create `/etc/systemd/system/farmtrust-ml.service`:
```ini
[Unit]
Description=FarmTrust ML Microservice
After=network.target

[Service]
User=your-user
WorkingDirectory=/path/to/microservice
ExecStart=/path/to/venv/bin/uvicorn app:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

## Troubleshooting

### Model not found error:
- Ensure `ml/pbl/xgboost_model.pkl` exists
- Check path in sys.path.append()

### Import errors:
- Verify all dependencies installed: `pip install -r requirements.txt`
- Check Python version: `python --version` (should be 3.10+)

### Connection refused from backend:
- Ensure microservice is running: `curl http://localhost:8000/health`
- Check NGROK_URL in backend/.env
- Verify firewall settings

## Next Steps

1. ✅ Start the microservice
2. ✅ Test with sample data
3. ✅ Connect backend
4. ✅ Test end-to-end flow
5. Setup ngrok for external access
6. Add monitoring and metrics
7. Deploy to production
