# API Integration & Authentication Guide

This document maps out the external API architecture inside `api_fetcher.py`. It explicitly details which APIs are currently live and functioning, and limits out the exact roadmap for the backend developers to acquire production keys for the remaining restricted government endpoints.

---

## 1. Live & Fully Connected APIs

### Open-Meteo (Climate & Weather)
- **Status:** LIVE (No Fallback usage)
- **Endpoint:** `https://api.open-meteo.com/v1/forecast`
- **Data Extracted:** `avg_temperature`, `rainfall` (scaled dynamically from `precipitation_sum`)
- **Authentication Required:** **None.** 
- **Developer Action:** No action required. This API is completely free and open-source. The backend maps abstract Python strings (like "North") to literal Indian geocoordinates (e.g. `28.6139, 77.2090`) to execute the live weather query directly.

---

## 2. Simulated APIs (Government Proxies)

The following datasets represent highly specific Indian economic and agricultural metadata. Currently, they trigger a `404 Not Found` and safely pull mathematical averages from our local `FALLBACK` dictionaries. To make these "Live", the backend architecture team must officially register and route keys.

### A. NDMA (National Disaster Management Authority)
- **Data Extracted:** `drought_index`, `flood_risk`
- **Current Simulated Endpoint:** `https://api.ndma.gov.in/v1/risk`
- **How to Get Real Keys:**
  1. Register a developer account at **[Open Government Data Platform India (data.gov.in)](https://data.gov.in/)**.
  2. Search the catalog for "National Disaster Management Authority Vulnerability Maps".
  3. Generate an Account API Key to query the JSON catalog. Update the Base URL in `api_fetcher.py` and pass the API Key inside the `/v1/` request headers.

### B. AGMARKNET (Agricultural Marketing)
- **Data Extracted:** `commodity_price_index`
- **Current Simulated Endpoint:** `https://api.agmarknet.gov.in/v1/price`
- **How to Get Real Keys:**
  1. Access the **[data.gov.in](https://data.gov.in/)** Developer Dashboard.
  2. Locate the "AGMARKNET Daily Mandi Prices" dataset block.
  3. Hook the API Auth Token into `api_fetcher.py`. (Alternatively, if strict authentication fails, AGMARKNET hosts an SOAP service via `agmarknet.gov.in` that requires scraping logic or a Python SOAP wrapper like `zeep`).

### C. Ministry of Agriculture (AgriCoop)
- **Data Extracted:** `input_cost_index`, `policy_support_score`
- **Current Simulated Endpoint:** `https://api.agricoop.gov.in/v1/...`
- **How to Get Real Keys:**
  1. This data is highly localized. It can typically be extracted via `APISetu.gov.in` or via aggregated economic CSVs hosted securely on `data.gov.in`. 
  2. A formal Web API Token must be established with the MoA Developer panel.

### D. Government Subsidy Schemes Registry
- **Data Extracted:** Dynamic JSON dictionary of available agricultural schemes.
- **Current Simulated Endpoint:** `https://api.india.gov.in/v1/schemes/agriculture`
- **How to Get Real Keys:**
  1. A master directory of schemes is hosted via the **MyScheme (`myscheme.gov.in`) API Sandbox**.
  2. An enterprise Auth Token must be mapped to intercept the array. Ensure the API response shape perfectly matches our local fallback schema (`scheme_id`, `max_land`, `req_sizes`) so that `subsidy_matcher.py` filters it successfully without modification.

---

## Summary for the Backend Team
The local python engine explicitly leverages **`asyncio.gather()`** to fire off all 5 HTTP requests simultaneously. The HTTP `urllib` engine is strictly engineered to catch timeout exceptions. Therefore, if authentication expires, or if the newly hooked `data.gov.in` servers go temporarily offline, the backend will completely naturally suppress the crash and inject the baseline fallback metrics to ensure 100% inference survival.
