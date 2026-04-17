# Data Parameters Specification: Farmer Credit & Subsidy Assessment System

This specification formally outlines the data points collected from the frontend UI, computed internally, and externally fetched by the system to assess farmer creditworthiness and eligible subsidies.

---

## 1. Inputs Taken from Farmers (Frontend Web Form)
These fields represent the inputs required from the farmer on the frontend form. They are designed using terminology that farmers understand, while the backend handles mapping them to the technical variables expected by the ML model.

### Identity & Contact Details (Practical UI Fields):
- **Farmer Name**: `String`
- **Phone Number**: `String`
- **Farmer ID / Aadhaar Number**: `String` *(Optional but recommended for practical linkage)*

### Location & Timing (Mapped to ML Inputs):
- **State & District**: `String` *(Selected from a dropdown by the farmer. The backend maps this to specific coordinates for APIs and to the ML variable `Region` [North/South/East/West].)*
- **Farming Season**: `Enum` (`Kharif`, `Rabi`, `Zaid`) *(Selected by the farmer. The backend maps this to the ML variable `Quarter` [Q1/Q2/Q3/Q4].)*

### Core Financial & Operational Fields:
- **Enterprise Size**: `Enum` (`Small`, `Medium`, `Large`)
- **Annual Revenue**: `Numeric` (in ₹ thousands, > 0)
- **Annual Expenses**: `Numeric` (in ₹ thousands, >= 0)
- **Loan Amount**: `Numeric` (Outstanding loan in ₹ thousands, >= 0)

### Agricultural Fields (Crucial for Subsidy Matching):
- **Landholding Size**: `Numeric` (in acres, > 0)
- **Crop Type**: `Enum` (`Wheat`, `Rice`, `Cotton`, `Maize`, `Pulses`, `Vegetables`, `Groundnut`)
- **Irrigation Type**: `Enum` (`Rainfed`, `Canal`, `Borewell`, `Sprinkler`, `Drip`)
- **Land Ownership Status**: `Enum` (`Owned`, `Leased`) *(Optional for UI context)*

---

## 2. Auto-Calculated Derived Fields (Backend)
These fields are derived automatically on the backend to prevent redundant data entry on the frontend. 

- **Net Profit**: Computed as `Annual Revenue - Annual Expenses` *(Can be negative)*
- **Debt-to-Equity Ratio**: Computed as `Loan Amount / (Annual Revenue * 2)`

---

## 3. Data Fetched via External APIs (Backend Automation)
These values are automatically fetched from external databases using the **`State & District` (mapped to coordinates/Region)** and **`Crop Type`** provided by the farmer. This data enriches the risk profile without requiring user intervention.

### India Meteorological Department (IMD) API
*(Key: Location/Region)*
- **Average Temperature**: Average temperature for the region in °C
- **Rainfall**: Annual rainfall for the region in mm

### National Disaster Management Authority (NDMA) API
*(Key: Location/Region)*
- **Drought Index**: Drought severity index (scale 0.0 to 1.0)
- **Flood Risk**: Flood risk score (scale 0.0 to 1.0)

### Agricultural Market Network (AGMARKNET) API
*(Key: Region + Crop Type)*
- **Commodity Price Index**: Market commodity price index for the specific crop

### Ministry of Agriculture API
*(Key: Region)*
- **Input Cost Index**: Agricultural input cost index for the specific region

### Government Policy Database
*(Key: Region)*
- **Policy Support Score**: Regional policy support level (integer scale 1 to 4)

---

## 4. Advanced Engineered Features (ML Microservice Internal)
When the backend forwards the assembled payload to the ML Microservice, the following indices are internally engineered by the model for XGBoost credit capability processing.

- **Financial Ratios**: 
  - `Expense-to-Revenue Ratio (ERR)`
  - `Debt Sustainability Ratio (DSR)`
  - `Net Profit Margin (NPM)`
- **Climate Risk Features**:
  - `Climate Resilience Index (CRI)`
  - `Temperature Stress Indicator (TSI)`
- **Market Risk Measure**: 
  - `Market Risk Indicator (MRI)` *(Commodity Price Index / Input Cost Index)*
- **Derived Encodings & Indicators**:
  - `financial_stability`
  - `leverage_risk`
  - `repayment_capacity`
