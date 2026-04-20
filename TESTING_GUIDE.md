# Testing Guide - Step by Step

## 🎯 What We're Testing

We have 3 API endpoints to test:
1. Health check - Is the server running?
2. Config enums - What are the valid options?
3. Assessment - Process farmer data

---

## 🚀 Setup Before Testing

### Step 1: Make sure dependencies are installed
```bash
cd backend
npm install
```

### Step 2: Check your .env file
```bash
# Open .env and verify these are set:
NGROK_URL=https://abc123.ngrok-free.app
APP_ENV=development
PORT=8000
```

### Step 3: Start the server
```bash
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:8000
📊 Environment: development
🔗 ML Service: https://abc123.ngrok-free.app
```

---

## 🧪 Test 1: Health Check

### What it does:
Checks if the server is alive and shows configuration.

### Using PowerShell:
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/health" -Method GET
```

### Using cURL:
```bash
curl http://localhost:8000/api/v1/health
```

### Using Browser:
Just open: `http://localhost:8000/api/v1/health`

### Expected Response:
```json
{
  "status": "ok",
  "ngrok_url": "https://abc123.ngrok-free.app",
  "env": "development"
}
```

### What this tells you:
- ✅ Server is running
- ✅ Configuration is loaded
- ✅ Ready to accept requests

---

## 🧪 Test 2: Get Valid Options (Enums)

### What it does:
Returns all valid values for dropdown fields (regions, crops, etc.)

### Using PowerShell:
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/config/enums" -Method GET
```

### Using cURL:
```bash
curl http://localhost:8000/api/v1/config/enums
```

### Using Browser:
Open: `http://localhost:8000/api/v1/config/enums`

### Expected Response:
```json
{
  "enterprise_size": ["Small", "Medium", "Large"],
  "region": ["North", "South", "East", "West"],
  "quarter": ["Q1", "Q2", "Q3", "Q4"],
  "crop_type": ["Wheat", "Rice", "Cotton", "Maize", "Pulses", "Vegetables", "Groundnut"],
  "irrigation_type": ["Rainfed", "Canal", "Borewell", "Sprinkler", "Drip"]
}
```

### What this tells you:
- ✅ Validation rules are working
- ✅ Frontend can use these for dropdowns
- ✅ Only these values will be accepted

---

## 🧪 Test 3: Submit Assessment (Main Test)

### What it does:
Processes farmer data through the entire pipeline.

### Test Data (test-request.json):
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

### Using PowerShell:
```powershell
$body = Get-Content "test-request.json" -Raw
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/assess" `
  -Method POST `
  -Body $body `
  -ContentType "application/json"
```

### Using cURL:
```bash
curl -X POST http://localhost:8000/api/v1/assess \
  -H "Content-Type: application/json" \
  -d @test-request.json
```

### Using PowerShell (inline):
```powershell
$body = @{
  enterprise_size = "Small"
  region = "East"
  quarter = "Q2"
  annual_revenue = 280.0
  annual_expenses = 195.0
  loan_amount = 120.0
  landholding_size = 1.5
  crop_type = "Rice"
  irrigation_type = "Rainfed"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/v1/assess" `
  -Method POST `
  -Body $body `
  -ContentType "application/json"
```

### Expected Behavior:

#### If ML service is NOT running (expected for now):
```json
{
  "error": "ML service unavailable",
  "detail": "Unable to reach ML microservice: ..."
}
```
**Status Code:** 503 (Service Unavailable)

This is NORMAL! The backend is working correctly. It's just that the ML service at the ngrok URL isn't running.

#### If ML service IS running:
```json
{
  "enterprise_id": "FARM-001",
  "probability_of_default": 0.3142,
  "credit_score": 68.58,
  "risk_category": "Medium Risk",
  "lending_recommendation": "Conditional — reduced amount or additional review",
  "top_features": [...],
  "eligible_subsidies": [...],
  "model_version": "1.0-XGB",
  "assessed_at": "2026-04-07T10:23:45.123Z"
}
```
**Status Code:** 200 (Success)

---

## 🔍 What Happens Behind the Scenes

When you submit the assessment, here's what the backend does:

### Step 1: Validation (0.1ms)
```
✓ Check all required fields present
✓ Check enterprise_size is "Small", "Medium", or "Large"
✓ Check region is "North", "South", "East", or "West"
✓ Check annual_revenue > 0
✓ Check all numeric fields are valid
```

### Step 2: Compute Derived Fields (0.1ms)
```
net_profit = 280.0 - 195.0 = 85.0
debt_to_equity = 120.0 / (280.0 * 2) = 0.214
```

### Step 3: Fetch External Data (50-200ms in dev mode)
```
Fetching from 5 APIs in parallel:
  ├─ IMD API (weather) → avg_temperature: 27.1, rainfall: 1420.0
  ├─ NDMA API (disaster) → drought_index: 0.30, flood_risk: 0.70
  ├─ AGMARKNET (prices) → commodity_price_index: 118.5
  ├─ Agri Ministry (costs) → input_cost_index: 92.0
  └─ Policy DB (support) → policy_support_score: 2

In development mode, these use MOCK DATA (no real API calls)
```

### Step 4: Assemble Payload (0.1ms)
```
Combine all 18 fields:
  - 11 from farmer input
  - 2 computed
  - 7 from external APIs
```

### Step 5: Call ML Service (100-30000ms)
```
POST https://abc123.ngrok-free.app/predict
Timeout: 30 seconds
```

### Step 6: Return Result (0.1ms)
```
Forward ML response to client
```

**Total Time:** Usually 200-500ms in development mode

---

## 🎬 Using the Automated Test Script

The easiest way to test everything at once:

```powershell
# Make sure server is running in one terminal
npm run dev

# In another terminal, run the test script
./test.ps1
```

### What the script does:
1. Tests health endpoint
2. Tests config/enums endpoint
3. Tests assess endpoint
4. Shows results in a nice format

### Sample Output:
```
=== Testing Farmer Credit Assessment Backend ===

1. Health Check
{
    "status": "ok",
    "ngrok_url": "https://abc123.ngrok-free.app",
    "env": "development"
}

2. Get Enum Values
{
    "enterprise_size": ["Small", "Medium", "Large"],
    ...
}

3. Submit Assessment Request
Expected error (ML service not running):
503
{
    "error": "ML service unavailable",
    "detail": "..."
}

=== Tests Complete ===
```

---

## 🐛 Testing Error Cases

### Test Invalid Region:
```json
{
  "enterprise_size": "Small",
  "region": "Invalid",  ← Wrong value
  "quarter": "Q2",
  ...
}
```
**Expected:** 422 error with message "region must be one of: North, South, East, West"

### Test Missing Required Field:
```json
{
  "enterprise_size": "Small",
  // region is missing
  "quarter": "Q2",
  ...
}
```
**Expected:** 422 error with message "region is required"

### Test Negative Revenue:
```json
{
  "enterprise_size": "Small",
  "region": "East",
  "annual_revenue": -100,  ← Negative
  ...
}
```
**Expected:** 422 error with message "annual_revenue must be greater than 0"

---

## 📊 Checking Server Logs

While testing, watch the server terminal. You'll see logs like:

```json
{"level":"INFO","message":"Incoming request","method":"POST","path":"/api/v1/assess"}
{"level":"INFO","message":"Assessment request received","enterprise_id":"FARM-001","region":"East"}
{"level":"DEBUG","message":"Derived fields computed","net_profit":85.0,"debt_to_equity":0.214}
{"level":"DEBUG","message":"IMD data fetched (mock)","region":"East","used_mock":true}
{"level":"INFO","message":"All external API calls completed","latency_ms":52}
{"level":"DEBUG","message":"Payload assembled","payload":{...}}
{"level":"INFO","message":"Sending request to ML microservice","endpoint":"https://..."}
{"level":"ERROR","message":"ML service unreachable","error":"..."}
```

These logs help you understand what's happening at each step!

---

## 🎯 Testing Checklist

- [ ] Server starts without errors
- [ ] Health endpoint returns 200
- [ ] Config/enums endpoint returns valid options
- [ ] Valid assessment request is processed (even if ML service fails)
- [ ] Invalid data returns 422 error
- [ ] Missing fields return 422 error
- [ ] Server logs show each processing step
- [ ] Response time is under 5 seconds

---

## 🔧 Advanced Testing with Postman

### Setup:
1. Download Postman (free)
2. Create a new collection called "Farmer Assessment"
3. Add 3 requests:

#### Request 1: Health Check
- Method: GET
- URL: `http://localhost:8000/api/v1/health`

#### Request 2: Get Enums
- Method: GET
- URL: `http://localhost:8000/api/v1/config/enums`

#### Request 3: Submit Assessment
- Method: POST
- URL: `http://localhost:8000/api/v1/assess`
- Headers: `Content-Type: application/json`
- Body: Raw JSON (paste from test-request.json)

### Benefits:
- Save requests for reuse
- See formatted responses
- Easy to modify test data
- View response time
- See headers and status codes

---

## 🎓 Understanding HTTP Status Codes

| Code | Meaning | When You'll See It |
|------|---------|-------------------|
| 200 | Success | Everything worked |
| 422 | Validation Error | Invalid input data |
| 500 | Server Error | Bug in our code |
| 502 | Bad Gateway | ML service returned error |
| 503 | Service Unavailable | ML service not reachable |

---

## 💡 Testing Tips

1. **Always check server logs** - They tell you what's happening
2. **Test one thing at a time** - Start with health, then enums, then assess
3. **Use the test script** - It's the fastest way to test everything
4. **Try invalid data** - Make sure errors are handled correctly
5. **Watch response times** - Should be under 5 seconds
6. **Test with different regions/crops** - Make sure mock data works for all

---

## 🚀 Next Steps

Once basic testing works:

1. **Set up real ML service** - Deploy your ML model and get ngrok URL
2. **Update NGROK_URL** - Put real URL in .env
3. **Test end-to-end** - Should get real credit scores
4. **Connect frontend** - Integrate with React app
5. **Test in production mode** - Set APP_ENV=production

---

## 📞 Troubleshooting

### Server won't start:
```bash
# Check if port is in use
netstat -ano | findstr :8000

# Kill the process or change PORT in .env
```

### Can't reach endpoints:
```bash
# Make sure server is running
# Check firewall settings
# Try http://127.0.0.1:8000 instead of localhost
```

### Getting 404 errors:
```bash
# Check URL is correct
# Make sure you're using /api/v1/ prefix
# Verify server started without errors
```

### Validation errors:
```bash
# Check your JSON syntax
# Verify all required fields are present
# Make sure values match allowed enums
```

---

Happy Testing! 🎉
