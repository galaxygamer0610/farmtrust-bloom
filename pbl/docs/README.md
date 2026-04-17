# Farmer Credit System: ML Backend Architecture & Execution Guide

This document outlines the exact role of every file in our machine learning microservice, organized by the specific sequence required to execute the pipeline from start to finish.

---

## Stage A: Core Architecture & Setup
*These files are foundational modules. They are imported by other scripts and do not need to be manually executed.*

### 1. `config.py`
**Role:** The universal dictionary for the backend. It stores static configurations such as the expected dataset file paths (`AgriRiskFin_Dataset.csv`), the mathematical `ALL_FEATURES` mapping list, and the `.pkl` serialization paths.

### 2. `api_fetcher.py`
**Role:** The Async Network Hub. It processes parallel HTTP requests. It mathematically maps abstract Indian regions to live Lat/Lon coordinates to pull real internet data via **Open-Meteo**, while securely handling timeout errors for restricted government endpoints via robust dictionary fallbacks.

### 3. `feature_engineering.py`
**Role:** The Mathematical Converter. It receives both raw internet API data and manual farmer form inputs, rigorously converting them into advanced ML metrics. It utilizes standard Corporate Finance laws (Debt Stability Ratios) and IPCC Climate Vulnerability indexing.

### 4. `credit_score.py`
**Role:** The Brain. It handles the dataset splitting, evaluates Logistic Regression, Random Forest, and XGBoost competitively, executes automated **Optuna grid searches**, and extracts the critical top 5 feature influence indices via `xgboost.predict_proba`.

### 5. `subsidy_matcher.py`
**Role:** The Rules Expert. It is a completely dynamic engine that absorbs a JSON registry of government schemes and methodically filters them out according to strict eligibility bounds (e.g., `min_land` or `max_rev`).

---

## 💡 Important Note for Backend Developers

When integrating this microservice into the main application, please ensure the following mappings are respected in your API calls:

1. **Location Mapping**: The frontend `state` and `city` fields must be passed. The ML backend internally maps these into one of the four cardinal **Regions** (North, South, East, West) to pull weather data.
2. **Agricultural Fields**: `landholding_size`, `irrigation_type`, and `yield_amount` are now critical for **both** Credit Scoring and Subsidy Matching. Ensure these are collected in the farmer onboarding form.
3. **Graceful Fallbacks**: The system is designed using `asyncio.gather()`. If external APIs (IMD/NDMA) are unresponsive, the system will automatically inject safe statistical defaults. **Do not modify the `FALLBACK` dictionaries unless authorized.**

---

## Stage B: Execution Sequence
*These are the active orchestrator files. Run them in this exact order via terminal.*

### Step 1: Clean the Dataset
**File:** `data_cleaning.py`
**Role:** Scans the raw Kaggle dataset for missing nulls, negatives, anomalous financial outliers, and scales variables cleanly. 
> **Command:** `python data_cleaning.py` 
*(Outputs: `AgriRiskFin_Dataset_Cleaned.csv`)*

### Step 2: Optimize and Train the Models
**File:** `train.py`
**Role:** The Training Orchestrator. It loads the cleaned dataset, funnels it through `feature_engineering.py`, tests the 3 algorithms inside `credit_score.py`, and serializes the winning mathematical structure to disk.
> **Command:** `python train.py`
*(Outputs: `xgboost_model.pkl` and terminal metrics)*

### Step 3: Run the Async Production Engine
**File:** `inference.py`
**Role:** The Production Web Endpoint. It accepts a JSON payload of a single farmer instance, simultaneously grabs internet API data via `api_fetcher.py`, processes the feature math, scores the credit risk, matches the subsidies, and builds our formal 18-parameter REST structure.
> **Command:** `python inference.py`
*(Outputs: The formatted JSON REST block representing a finalized user assessment)*

### Step 4: Validate the Network Layers
**File:** `tests/test_api_fetcher.py`
**Role:** The Sentinel. It leverages Python `unittest` to forcibly break the server endpoints, proving that the fallback mechanisms gracefully salvage the query instead of crashing the pipeline.
> **Command:** `python tests/test_api_fetcher.py`
*(Outputs: Passes and OK assertions)*
