# Quick Start Guide

## 1. Install Dependencies

```bash
npm install
```

## 2. Configure Environment

The `.env` file is already set up with development defaults. To connect to your ML microservice:

1. Start your ML microservice
2. Expose it via ngrok: `ngrok http <ML_SERVICE_PORT>`
3. Update `NGROK_URL` in `.env` with your ngrok URL

Example:
```env
NGROK_URL=https://your-actual-ngrok-url.ngrok-free.app
```

## 3. Start the Server

```bash
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:8000
📊 Environment: development
🔗 ML Service: https://your-ngrok-url.ngrok-free.app
```

## 4. Test the API

### Option A: Use PowerShell Test Script (Windows)
```powershell
./test.ps1
```

### Option B: Use cURL
```bash
# Health check
curl http://localhost:8000/api/v1/health

# Submit assessment
curl -X POST http://localhost:8000/api/v1/assess \
  -H "Content-Type: application/json" \
  -d @test-request.json
```

### Option C: Use Postman or Thunder Client
Import the following request:

**POST** `http://localhost:8000/api/v1/assess`

**Headers:**
```
Content-Type: application/json
```

**Body:**
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

## 5. Expose Your Backend via ngrok (Optional)

If you want to expose this backend to the internet:

```bash
# In a new terminal
ngrok http 8000
```

Copy the ngrok URL and use it in your frontend configuration.

## Development Mode Features

In development mode (`APP_ENV=development`):
- ✅ Mock data is used for all external APIs (no real API calls)
- ✅ CORS is enabled for all origins
- ✅ Detailed DEBUG logging available
- ✅ Hot reload with nodemon

## Next Steps

1. ✅ Backend is running
2. 🔄 Connect your ML microservice (update NGROK_URL)
3. 🎨 Integrate with your frontend
4. 🚀 Deploy to production

## Troubleshooting

### Server won't start
- Check if port 8000 is already in use
- Verify Node.js is installed: `node --version`
- Check `.env` file exists

### ML Service errors
- Verify NGROK_URL is correct in `.env`
- Check ML microservice is running
- Test ML service directly: `curl <NGROK_URL>/predict`

### Validation errors
- Check request body matches the schema in `test-request.json`
- Verify all required fields are present
- Ensure enum values are exact matches (case-sensitive)

## API Documentation

See [README.md](./README.md) for complete API documentation.
