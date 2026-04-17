# Exploratory Data Analysis & Data Cleaning Observations

This document summarizes the insights gained from analyzing the `AgriRiskFin_Dataset.csv` before and after the data engineering pipeline was applied. The analysis directly shaped the operations in `data_cleaning.py`.

## 1. Catching the Negative Revenue Anomaly (Pre-Cleaning)
While analyzing the raw dataset, the `.describe()` function revealed a critical anomaly: **Minimum Revenue was exactly `-54.49`**. 
- **The Problem**: Revenue cannot logically be negative in this context; it indicates a data entry error or an unintended algorithmic swap with Net Profit during dataset synthesis. 
- **The Observation**: 4 specific rows violated this boundary condition.
- **The Solution (Post-Cleaning)**: We successfully identified and extracted the true positive revenue for these rows by recalculating `imputed_revenue = Net_Profit + Expenses`. The post-cleaned dataset now correctly enforces a zero boundary on Revenue, keeping the distributions intact.

## 2. Policy Support Score Scale Correction (Pre-Cleaning)
- **The Problem**: The raw dataset scored `Policy_Support_Score` on a scale from `0` to `10`. Our backend Feature Engineering architecture and SRS documentation strictly require this to be scaled from `1` to `4` prior to min-max normalization.
- **The Solution (Post-Cleaning)**: We performed an ordinal mapping of the scale:
  - `0-2` mapped to `1`
  - `3-5` mapped to `2`
  - `6-8` mapped to `3`
  - `9-10` mapped to `4`
- **Result**: The cleaned data perfectly aligns with the `np.clip((policy - 1) / 3.0, 0, 1)` feature engineering expectation.

## 3. Dataset Integrity & Missing Values
- **Observation**: A structural `.info()` analysis revealed **0 null values** across all 17 columns and 4,981 rows. The initial dataset was remarkably dense.
- **Robustness**: Despite the lack of nulls, we implemented resilient `dropna()` (for identifying columns) and `fillna()` (median for numeric, mode for categorical) logic in `data_cleaning.py` to ensure future data streaming or batch inferences handle missing entries gracefully.

## 4. Class Distribution & Imbalance
When grouping the target variable (`Financial_Risk_Level`), we observed the following distribution:
- **Medium Risk**: 2,267 
- **High Risk**: 2,267
- **Low Risk**: 447

- **Observation**: The dataset acts functionally as a binary imbalance for modelling (High Risk instances vs Non-High Risk instances). The `Low Risk` class is a extreme minority. 
- **Action Taken**: We successfully handled this in `credit_score.py` by applying XGBoost's `scale_pos_weight` mathematically to penalize the model fairly when evaluating High vs Medium/Low default probabilities.
