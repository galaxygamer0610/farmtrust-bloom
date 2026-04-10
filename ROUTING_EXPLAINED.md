# Routing Explained - Visual Guide

## 🗺️ What is Routing?

Routing is like a **GPS for your web server**. It tells the server:
- "When someone visits THIS URL..."
- "...do THAT action"

Think of it like a restaurant menu:
- Each URL is a dish name
- Each route handler is the recipe
- The server is the kitchen

---

## 📍 Our Routes Map

```
http://localhost:8000
│
├── /                              → Root (welcome message)
│
└── /api/v1/                       → API version 1
    │
    ├── /health                    → GET: Check server status
    │
    ├── /config/enums              → GET: Get valid options
    │
    └── /assess                    → POST: Process farmer data
```

---

## 🔍 How Routing Works in Our Project

### Level 1: server.js (Main Router)

```javascript
const express = require('express');
const app = express();
const assessRoutes = require('./routes/assess');

// Mount the assess routes at /api/v1
app.use('/api/v1', assessRoutes);
//       ↑          ↑
//       Base URL   Route file

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Farmer Assessment API' });
});

app.listen(8000);
```

**What this does:**
- Creates an Express app
- Says "All routes in assessRoutes should start with /api/v1"
- Starts listening on port 8000

---

### Level 2: routes/assess.js (Specific Routes)

```javascript
const express = require('express');
const router = express.Router();

// Route 1: Health Check
router.get('/health', (req, res) => {
  // Full URL: /api/v1 + /health = /api/v1/health
  res.json({ status: 'ok' });
});

// Route 2: Get Enums
router.get('/config/enums', (req, res) => {
  // Full URL: /api/v1 + /config/enums = /api/v1/config/enums
  res.json({ regions: [...], crops: [...] });
});

// Route 3: Assessment
router.post('/assess', async (req, res) => {
  // Full URL: /api/v1 + /assess = /api/v1/assess
  // Process the farmer data...
  res.json({ credit_score: 68.5 });
});

module.exports = router;
```

---

## 🎯 Complete Route Breakdown

### Route 1: Health Check

```
┌─────────────────────────────────────────────────────────┐
│ GET http://localhost:8000/api/v1/health                │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ server.js receives request                              │
│ Matches: app.use('/api/v1', assessRoutes)              │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ routes/assess.js receives request                       │
│ Matches: router.get('/health', ...)                    │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Execute handler function:                               │
│ router.get('/health', (req, res) => {                  │
│   res.json({ status: 'ok', env: 'development' });      │
│ });                                                     │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Response sent back to client:                           │
│ { "status": "ok", "env": "development" }                │
└─────────────────────────────────────────────────────────┘
```

**Code:**
```javascript
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    ngrok_url: config.ngrokUrl,
    env: config.appEnv,
  });
});
```

**Parameters:**
- `req` - Request object (contains data from client)
- `res` - Response object (used to send data back)

---

### Route 2: Config Enums

```
┌─────────────────────────────────────────────────────────┐
│ GET http://localhost:8000/api/v1/config/enums          │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ server.js → routes/assess.js                            │
│ Matches: router.get('/config/enums', ...)              │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Execute handler:                                        │
│ Return ENUMS object from validation.js                 │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ Response:                                               │
│ {                                                       │
│   "region": ["North", "South", "East", "West"],        │
│   "crop_type": ["Wheat", "Rice", ...]                  │
│ }                                                       │
└─────────────────────────────────────────────────────────┘
```

**Code:**
```javascript
router.get('/config/enums', (req, res) => {
  res.status(200).json({
    enterprise_size: ENUMS.enterpriseSize,
    region: ENUMS.region,
    quarter: ENUMS.quarter,
    crop_type: ENUMS.cropType,
    irrigation_type: ENUMS.irrigationType,
  });
});
```

---

### Route 3: Assessment (The Big One!)

```
┌─────────────────────────────────────────────────────────┐
│ POST http://localhost:8000/api/v1/assess               │
│ Body: { region: "East", crop_type: "Rice", ... }       │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ server.js → routes/assess.js                            │
│ Matches: router.post('/assess', ...)                   │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 1: Validate Request                                │
│ ├─ Check required fields                               │
│ ├─ Check enum values                                   │
│ └─ Check numeric constraints                           │
│ If invalid → Return 422 error                          │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 2: Compute Derived Fields                          │
│ ├─ net_profit = revenue - expenses                     │
│ └─ debt_to_equity = loan / (revenue * 2)               │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 3: Fetch External Data (Parallel)                  │
│ ├─ fetchIMD(region) → temperature, rainfall            │
│ ├─ fetchNDMA(region) → drought, flood risk             │
│ ├─ fetchAgmarknet(region, crop) → prices               │
│ ├─ fetchAgriMinistry(region) → input costs             │
│ └─ fetchPolicy(region) → policy support                │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 4: Assemble Complete Payload                       │
│ Combine all 18 fields into one object                  │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 5: Call ML Service                                 │
│ POST to ngrok URL with assembled payload               │
│ Wait up to 30 seconds for response                     │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ STEP 6: Return Result                                   │
│ Forward ML response to client                          │
│ { credit_score: 68.5, risk_category: "Medium", ... }   │
└─────────────────────────────────────────────────────────┘
```

**Code (simplified):**
```javascript
router.post('/assess', async (req, res) => {
  try {
    // Step 1: Validate
    const validation = validateRequest(req.body);
    if (!validation.isValid) {
      return res.status(422).json({ error: validation.errors });
    }

    // Step 2: Compute derived fields
    const derivedFields = computeDerivedFields(req.body);

    // Step 3: Fetch external data
    const externalData = await fetchAllExternalData(
      req.body.region, 
      req.body.crop_type
    );

    // Step 4: Assemble payload
    const mlPayload = assemblePayload(
      req.body, 
      externalData, 
      derivedFields
    );

    // Step 5: Call ML service
    const mlResult = await callMLService(mlPayload);

    // Step 6: Return result
    if (mlResult.success) {
      return res.status(200).json(mlResult.data);
    } else {
      return res.status(mlResult.statusCode).json({
        error: mlResult.error
      });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});
```

---

## 🔄 HTTP Methods Explained

### GET - Retrieve Data
```javascript
router.get('/health', (req, res) => {
  // Just reading/getting information
  // No data modification
  res.json({ status: 'ok' });
});
```

**Use for:** Reading data, checking status, getting lists

### POST - Send Data
```javascript
router.post('/assess', (req, res) => {
  // Receiving data in req.body
  // Processing it
  // Returning result
  const data = req.body;
  res.json({ result: 'processed' });
});
```

**Use for:** Creating records, submitting forms, processing data

### Other Methods (not used in our project):
- **PUT** - Update entire record
- **PATCH** - Update part of record
- **DELETE** - Remove record

---

## 📦 Request and Response Objects

### Request Object (req)

```javascript
router.post('/assess', (req, res) => {
  // req.body - Data sent by client (JSON)
  console.log(req.body.region);  // "East"
  
  // req.params - URL parameters
  // Example: /user/:id → req.params.id
  
  // req.query - Query string
  // Example: /search?q=rice → req.query.q
  
  // req.headers - HTTP headers
  console.log(req.headers['content-type']);
  
  // req.method - HTTP method
  console.log(req.method);  // "POST"
  
  // req.path - URL path
  console.log(req.path);  // "/assess"
});
```

### Response Object (res)

```javascript
router.get('/health', (req, res) => {
  // res.json() - Send JSON response
  res.json({ status: 'ok' });
  
  // res.status() - Set status code
  res.status(200).json({ success: true });
  
  // res.send() - Send any type of response
  res.send('Hello World');
  
  // res.sendFile() - Send a file
  res.sendFile('/path/to/file.pdf');
});
```

---

## 🛣️ Route Parameters (Advanced)

We don't use these in our project, but here's how they work:

```javascript
// Define route with parameter
router.get('/farmer/:id', (req, res) => {
  const farmerId = req.params.id;
  res.json({ farmer_id: farmerId });
});

// Usage:
// GET /api/v1/farmer/123
// → req.params.id = "123"
```

---

## 🔍 Query Parameters (Advanced)

```javascript
// Route without parameters
router.get('/search', (req, res) => {
  const region = req.query.region;
  const crop = req.query.crop;
  res.json({ region, crop });
});

// Usage:
// GET /api/v1/search?region=East&crop=Rice
// → req.query.region = "East"
// → req.query.crop = "Rice"
```

---

## 🎯 Middleware in Routing

Middleware runs BEFORE your route handler:

```javascript
// Global middleware (runs for ALL routes)
app.use(express.json());  // Parse JSON bodies
app.use(cors());          // Enable CORS

// Route-specific middleware
const checkAuth = (req, res, next) => {
  if (req.headers.authorization) {
    next();  // Continue to route handler
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

router.post('/assess', checkAuth, async (req, res) => {
  // This only runs if checkAuth calls next()
});
```

**Flow:**
```
Request → Global Middleware → Route Middleware → Route Handler → Response
```

---

## 📊 Route Organization Best Practices

### ✅ Good (What we do):
```javascript
// server.js
app.use('/api/v1', assessRoutes);
app.use('/api/v1', farmerRoutes);
app.use('/api/v1', subsidyRoutes);

// routes/assess.js
router.post('/assess', ...);
router.get('/health', ...);

// routes/farmer.js
router.get('/farmers', ...);
router.post('/farmers', ...);
```

### ❌ Bad:
```javascript
// Everything in server.js
app.post('/api/v1/assess', ...);
app.get('/api/v1/health', ...);
app.get('/api/v1/farmers', ...);
// ... 50 more routes
```

---

## 🎨 Route Naming Conventions

### RESTful URL Structure:
```
GET    /api/v1/farmers          → List all farmers
POST   /api/v1/farmers          → Create new farmer
GET    /api/v1/farmers/:id      → Get specific farmer
PUT    /api/v1/farmers/:id      → Update farmer
DELETE /api/v1/farmers/:id      → Delete farmer

GET    /api/v1/farmers/:id/assessments  → Get farmer's assessments
POST   /api/v1/assess                   → Create assessment
```

### Our Structure:
```
GET    /api/v1/health           → Health check
GET    /api/v1/config/enums     → Configuration
POST   /api/v1/assess           → Process assessment
```

---

## 🔧 Testing Routes

### Using cURL:
```bash
# GET request
curl http://localhost:8000/api/v1/health

# POST request
curl -X POST http://localhost:8000/api/v1/assess \
  -H "Content-Type: application/json" \
  -d '{"region":"East","crop_type":"Rice",...}'
```

### Using PowerShell:
```powershell
# GET request
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/health"

# POST request
$body = @{ region = "East"; crop_type = "Rice" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/assess" `
  -Method POST -Body $body -ContentType "application/json"
```

### Using Browser:
- GET requests: Just type URL in address bar
- POST requests: Need Postman or similar tool

---

## 🎓 Summary

### Key Concepts:
1. **Routes** = URL patterns that trigger specific code
2. **HTTP Methods** = GET (read), POST (create/process), etc.
3. **Route Handlers** = Functions that run when route is matched
4. **Middleware** = Functions that run before route handlers
5. **req** = Request object (data from client)
6. **res** = Response object (send data back)

### Our Routes:
```
GET  /api/v1/health        → Check if server is alive
GET  /api/v1/config/enums  → Get valid dropdown options
POST /api/v1/assess        → Process farmer assessment
```

### Route Flow:
```
Client Request 
  → Server receives 
  → Middleware processes 
  → Route matches 
  → Handler executes 
  → Response sent 
  → Client receives
```

---

## 💡 Practice Exercise

Try adding a new route yourself!

```javascript
// In routes/assess.js

// Add this route
router.get('/test', (req, res) => {
  res.json({ 
    message: 'This is my test route!',
    timestamp: new Date()
  });
});

// Test it:
// GET http://localhost:8000/api/v1/test
```

Then try:
1. Add a route that accepts a name parameter
2. Add a route that returns your favorite crop
3. Add a route that calculates something simple

---

Happy Routing! 🚀
