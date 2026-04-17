# Farmer Credit System: Data Contract

This document outlines the strict JSON schemas required to interact with the underlying `inference.py` asynchronous engine. It acts as the direct blueprint for generating **Pydantic Models** inside any FastAPI endpoints connecting to this architecture.

---

## 1. Request Body (Input Parameters)
This payload represents the data submitted natively by a User (e.g., via a frontend Application form). The ML engine securely expects these exact structures.

```json
{
  "enterprise_id": "FARM-12345-XYZ",       // String (Optional) - UUID generated if blank.
  "enterprise_size": "Small",              // Enum (Required) ["Small", "Medium", "Large"]
  "region": "West",                        // Enum (Required) ["North", "South", "East", "West"]
  "quarter": "Q2",                         // Enum (Optional) ["Q1", "Q2", "Q3", "Q4"]
  "annual_revenue": 150.0,                 // Float (Required) - In thousands/lakhs scale
  "annual_expenses": 120.0,                // Float (Required) - Used to compute net ratios
  "loan_amount": 50.0,                     // Float (Required) - Requested principal
  "landholding_size": 2.5,                 // Float (Required) - Represents operational acreage
  "crop_type": "Wheat",                    // String (Required) - e.g. "Wheat", "Cotton", "Rice"
  "irrigation_type": "Canal",              // Enum (Required) ["Canal", "Drip", "Sprinkler", "Rainfed"]
  "yield_amount": 5.0                      // Float (Required) - Scaling 1.0 to 10.0
}
```

> [!CAUTION]
> **External API Enrichment:** The backend engine uses `region` to secretly trigger the **Open-Meteo Weather API** internally, and uses `crop_type` against the AGMARKNET pricing matrix. Do not allow users to pass unrestricted input parameters for these fields; they must strictly conform to expected categorical bands.

---

## 2. Response Body (Output Parameters)
Once the `full_assessment` async loop finishes fetching missing data and resolving XGBoost scoring mathematically, it yields this precise REST output block back to the caller.

```json
{
  "enterprise_id": "FARM-12345-XYZ",
  "probability_of_default": 0.0001,          // Float (0.0001 -> 1.0)
  "credit_score": 99.99,                     // Float (Scaled 0-100)
  "risk_category": "Low Risk",               // Enum ["Low Risk", "Medium Risk", "High Risk"]
  "lending_recommendation": "Eligible - proceed...", // String 
  
  "top_features": [
    {
      "label": "leverage_risk",              // Internal ML Variable Name
      "value": 0.033,                        // Float (Actual parameter calculated for user)
      "importance": 25.55                    // Float (% showing how heavily this influenced the score)
    }
  ],
  
  "eligible_subsidies": [
    {
      "scheme_id": "SS004",                  // Government standard ID
      "scheme_name": "Per Drop More Crop",   // Human-readable title
      "benefits": "55% subsidy on Drip...",  // String details
      "match_score": 1.0                     // Float (1.0 = Perfect Constraint Fit)
    }
  ],
  
  "model_version": "1.2-Dynamic-Matcher",    // Version Tracker
  "assessed_at": "2026-04-17T05:42:48.333Z"  // ISO-8601 Timestamp Generation
}
```

### Response Array Handling
- `top_features`: A dynamic JSON Array containing the top 5 largest parameters shifting the XGBoost probability curves. The Frontend UI can use this array to dynamically draw "Why you were approved" charts for the user interface.
- `eligible_subsidies`: A dynamic nested Array filtered synchronously from the Government Registry (or placeholder registry) that passes bounding criteria (e.g., specific `landholding_size` matches).
