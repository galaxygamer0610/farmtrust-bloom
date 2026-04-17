# ML-Based Creditworthiness Prediction & Subsidy Matching for Farmers

**PICT Batch E4 | AY 2025-26**  
Jyotiraditya Jadhav · Shriya Mokashi · Aryan Mutyal · Ojas Sangwai  
Guide: Prof. Parag Jambhulkar

---

## 1. Project Overview

This notebook implements the complete ML pipeline for a creditworthiness prediction and subsidy matching system for agricultural enterprises, strictly following the SRS and mapping all outputs to the database ER diagram.

**Dataset:** AgriRiskFin_Dataset.csv — Kaggle (programmer3)  
**Size:** 4,981 rows × 17 columns | **Null values:** None

### Notebook Sections

| # | Section | SRS Reference |
|---|---------|---------------|
| 1 | Setup & Load Data | §11 Step 1 — Data Acquisition |
| 2 | Data Inspection & Mapping | §11 Step 1A/1B |
| 3 | Exploratory Data Analysis | §11 |
| 4 | Feature Engineering | §11 Step 3 |
| 5 | Model Training & Comparison | §11 Step 4 |
| 6 | Credit Score & Risk Categorization | §11 Steps 5–6 |
| 7 | Explainability — Feature Importance | §12.4 |
| 8 | Subsidy Matcher Module | §12.5 |
| 9 | Database Table Export | ER Diagram Tables 5, 6, 7, 9 |
| 10 | Inference Pipeline & Model Save | §18.2 |

---

## 2. Data Sources & Input Variables

Per SRS §11 Step 1, data comes from two sources: farmer-provided inputs submitted via the web form, and automatically fetched external API data keyed on the farmer's region and crop type.

### 2.1 Farmer-Provided Inputs (SRS §11 Step 1A)

| Variable | Dataset Column | Description |
|----------|---------------|-------------|
| Enterprise Size | Enterprise_Size | Small / Medium / Large |
| Region | Region | North / South / East / West (mapped from district/state) |
| Quarter | Quarter | Q1 / Q2 / Q3 / Q4 (financial quarter) |
| Annual Revenue | Revenue | Total annual revenue in ₹ thousands |
| Annual Expenses | Expenses | Total annual expenses in ₹ thousands |
| Loan Amount | Loan_Amount | Existing loan outstanding in ₹ thousands |
| Net Profit | Net_Profit | Pre-computed in dataset: Revenue − Expenses |
| Debt-to-Equity | Debt_to_Equity | Pre-computed in dataset: Loan / Asset Value |

### 2.2 Auto-Fetched from External APIs (SRS §11 Step 1B)

In production these values are fetched automatically using the farmer's region and crop type. In the notebook they come from the dataset, which was built from the same API sources.

| Variable | Dataset Column | API Source | Keyed On |
|----------|---------------|------------|----------|
| Avg Temperature | Avg_Temperature | IMD (India Meteorological Dept.) | Region |
| Rainfall | Rainfall | IMD API | Region |
| Drought Index | Drought_Index | NDMA API | Region |
| Flood Risk Score | Flood_Risk_Score | NDMA API | Region |
| Commodity Price Index | Commodity_Price_Index | AGMARKNET API | Crop + Region |
| Input Cost Index | Input_Cost_Index | Agri Ministry API | Region |
| Policy Support Score | Policy_Support_Score | Government Policy DB | Region |

### 2.3 Target Variable

`Financial_Risk_Level` (original 3-class): Low / Medium / High

Converted to binary per SRS §12.2:
- **High Risk → Default = 1** (financially distressed, likely to default)
- **Low + Medium Risk → Non-Default = 0** (financially stable)

---

## 3. Exploratory Data Analysis (EDA)

EDA examines which variables separate defaulting enterprises from non-defaulting ones before any modelling. All figures are saved to `outputs/`.

### Fig 1 — Key Patterns (2×3 panel)

| Panel | Variable | What It Shows |
|-------|----------|---------------|
| Top-left | Default rate by Enterprise Size | Small enterprises default most; Large default least |
| Top-centre | Default rate by Region | Regional structural differences in agricultural risk |
| Top-right | Net Profit distribution | Defaulters cluster on the negative side — strong separation |
| Bottom-left | Loan Amount distribution | Defaulters carry larger loans relative to revenue |
| Bottom-centre | Drought Index [NDMA API] | High-drought areas correlate with higher default rate |
| Bottom-right | Commodity Price Index [AGMARKNET] | Market pressure visible in default class shift |

### Fig 2 — Correlation Heatmap

Lower-triangular Pearson correlation matrix across all 13 numeric features. Shows which raw features correlate with the default label and which features are redundant with each other (e.g. Revenue and Net Profit). Highly correlated raw pairs are addressed in Feature Engineering by computing ratios instead of using both raw values.

### Mean Value Comparison Table

Printed table comparing mean feature values between Non-Default and Default classes with a difference column — quantifies how much each variable shifts across classes.

---

## 4. Feature Engineering (SRS §11 Step 3)

Raw inputs and API-fetched values are transformed into structured model-ready features. All formulas follow the SRS Feature Engineering Layer specification exactly.

### 4.1 Financial Features (SRS §3.1) — Farmer-Provided Data

| Feature | Formula | Clip Range | Interpretation |
|---------|---------|------------|----------------|
| ERR — Expense-to-Revenue Ratio | Expenses / Revenue | [0, 3] | Higher = more cost burden → higher risk |
| DSR — Debt Sustainability Ratio | Loan Amount / Revenue | [0, 5] | Higher = more debt relative to income → higher risk |
| NPM — Net Profit Margin | Net Profit / Revenue | [−2, 1] | Negative = unprofitable → higher risk |
| DE_ratio — Debt-to-Equity | Debt_to_Equity (from dataset) | [0, 5] | Higher leverage = more financial fragility |

### 4.2 Climate Risk Features (SRS §3.2) — IMD / NDMA API Data

| Feature | Formula | Interpretation |
|---------|---------|----------------|
| CRI — Climate Resilience Index | `(0.40 × rain_norm) − (0.35 × drought) − (0.25 × flood) + 0.35`, clipped [0, 1] | Higher = more resilient region. Reduces default risk. |
| TSI — Temperature Stress Indicator | `|avg_temperature − 23.5| / 10`, clipped [0, 1] | Deviation from optimal crop temperature (23.5°C). Higher = more crop stress. |

`rain_norm` is min-max normalised rainfall using dataset range. The 23.5°C optimal threshold is the midpoint of the 20–27°C ideal crop growth range.

### 4.3 Market Risk Feature (SRS §3.3) — AGMARKNET API Data

| Feature | Formula | Interpretation |
|---------|---------|----------------|
| MRI — Market Risk Indicator | `Commodity_Price_Index / Input_Cost_Index`, clipped [0.3, 3.0] | < 1 = margin squeeze (inputs cost more than output price). Higher risk when MRI < 1. |

### 4.4 Encodings & Derived Indicators (SRS §3.4–3.5)

| Feature | Method | Values / Range |
|---------|--------|----------------|
| enterprise_enc | Ordinal mapping | Small=0, Medium=1, Large=2 |
| policy_norm | Min-max normalisation of Policy_Support_Score | [0, 1] |
| quarter_enc | Ordinal mapping | Q1=0, Q2=1, Q3=2, Q4=3 |
| financial_stability | `1 − ERR / 2`, clipped [0, 1] | Higher = more financially stable |
| leverage_risk | `DE_ratio / 5`, clipped [0, 1] | Higher = more leveraged |
| repayment_capacity | `NPM / 2 + 0.5`, clipped [0, 1] | Higher = better ability to repay |

### 4.5 Full Feature List — Model Input

**Total: 27 features**

- **Raw numeric (11):** annual_revenue, annual_expenses, loan_amount, net_profit, avg_temperature, rainfall, drought_index, flood_risk, commodity_idx, input_cost_idx, policy_score
- **Engineered (13):** ERR, DSR, NPM, DE_ratio, CRI, TSI, MRI, enterprise_enc, policy_norm, quarter_enc, financial_stability, leverage_risk, repayment_capacity
- **Region OHE (3):** region_North, region_South, region_West (East is the dropped baseline)

### Fig 3 — Engineered Feature Class Separation (3×4 panel)

Overlapping histograms (green = Non-Default, red = Default) for all 12 engineered features. Dashed lines mark class means. The further apart the dashed lines, the stronger the individual predictor.

---

## 5. Model Training & Comparison (SRS §11 Step 4)

Three candidate algorithms specified in the SRS are trained on the same feature matrix and compared. The best model by ROC-AUC is selected for deployment.

### 5.1 Train / Test Split

- 80% training, 20% test
- Stratified split — preserves class ratio in both sets
- `random_state=42` for reproducibility

### 5.2 Algorithm 1 — Logistic Regression

| Parameter | Value | Reason |
|-----------|-------|--------|
| C (regularisation) | 1.0 | Default — balanced bias-variance |
| max_iter | 1000 | Ensures convergence on larger feature sets |
| class_weight | balanced | Auto-adjusts for class imbalance |
| solver | lbfgs | Efficient for dense feature matrices |
| Preprocessing | StandardScaler | LR requires standardised features |

### 5.3 Algorithm 2 — Random Forest Classifier

| Parameter | Value | Reason |
|-----------|-------|--------|
| n_estimators | 100 | Good accuracy vs training time trade-off |
| max_depth | 8 | Prevents overfitting on structured tabular data |
| class_weight | balanced | Handles imbalance without resampling |
| n_jobs | -1 | Uses all CPU cores for parallel training |
| Preprocessing | None | Tree-based models do not require feature scaling |

### 5.4 Algorithm 3 — XGBoost (Gradient Boosting)

XGBoost is listed explicitly in SRS §10.1 as a required library (`XGBoost v1.7+`). It is the primary candidate under the Gradient Boosting Classifier category.

| Parameter | Value | Reason |
|-----------|-------|--------|
| n_estimators | 200 | More trees benefit gradient boosting more than bagging |
| max_depth | 5 | Shallow trees prevent overfitting in boosting |
| learning_rate | 0.05 | Small step size for better generalisation |
| subsample | 0.8 | 80% row sampling per tree — reduces variance |
| colsample_bytree | 0.8 | 80% feature sampling per tree — reduces inter-tree correlation |
| scale_pos_weight | count(0) / count(1) | Computed from training set — handles class imbalance natively |
| eval_metric | logloss | Log loss for well-calibrated probability outputs |
| Preprocessing | None | Tree-based — no scaling needed |

### 5.5 Evaluation Metrics

| Metric | Formula | Why Used |
|--------|---------|----------|
| Accuracy | (TP+TN) / (TP+TN+FP+FN) | Overall correctness |
| Precision | TP / (TP+FP) | How many predicted defaults are actual defaults |
| Recall | TP / (TP+FN) | How many actual defaults are caught |
| F1 Score | 2 × (P × R) / (P + R) | Balances precision and recall |
| ROC-AUC | Area under ROC curve | Primary metric — threshold-independent, handles imbalance |
| CV-AUC | 5-fold stratified cross-validation mean | Validates model generalisation |

### 5.6 Fig 4 — Model Comparison (1×2 panel)

- **Left:** ROC curves for all three models with AUC scores in legend
- **Right:** Grouped bar chart comparing Accuracy, F1, ROC-AUC across all three models

### 5.7 Model Selection

XGBoost is selected as the final model because it achieves the highest ROC-AUC and F1 score. Unlike Logistic Regression, it captures non-linear feature interactions. Unlike Random Forest, it handles class imbalance directly through `scale_pos_weight` and is listed as a required dependency in the SRS.

---

## 6. Credit Score & Risk Categorization (SRS §11 Steps 5–6)

### 6.1 Credit Score Formula (SRS §12.3)

```
Credit Score = (1 − P(default)) × 100
```

- `P(default)` ∈ [0, 1] — probability output from `xgb.predict_proba()`
- `Credit Score` ∈ [0, 100] — higher score = lower risk
- Follows inverse-risk principle: a farm unlikely to default gets a high score

### 6.2 Risk Categorization Thresholds (SRS Risk Band Table)

| Credit Score Range | Risk Category | Lending Recommendation |
|:-----------------:|:-------------:|------------------------|
| 80 – 100 | 🟢 Low Risk | Eligible — proceed with standard loan terms |
| 50 – 79 | 🟡 Medium Risk | Conditional — reduced amount or additional review |
| 0 – 49 | 🔴 High Risk | High risk — flag for manual review before approval |

### 6.3 Fig 5 — Credit Score Dashboard (1×3 panel)

| Panel | Content |
|-------|---------|
| Left | Score distribution histogram coloured by risk band, threshold lines at 50 and 80 |
| Centre | Pie chart showing % of enterprises in each risk category |
| Right | XGBoost confusion matrix on test set |

### 6.4 Inputs and Outputs

**Input:** Farmer profile dict + trained XGBoost model + feature names list

**Output:**

| Field | Type | Example |
|-------|------|---------|
| probability_of_default | float [0, 1] | 0.7234 |
| credit_score | float [0, 100] | 27.66 |
| risk_category | string | "High Risk" |
| lending_recommendation | string | "High risk — flag for manual review" |

---

## 7. Explainability — XGBoost Feature Importance (SRS §12.4)

The SRS requires interpretable outputs showing key risk factors. XGBoost's built-in gain importance is used as the explainability mechanism.

### 7.1 Importance Type: Gain

Gain measures the average improvement in model accuracy each feature contributes when used in a split, averaged across all 200 trees. It is the most informative importance metric for understanding which features drive the model's decisions.

| Importance Type | Definition | Used For |
|----------------|------------|----------|
| **Gain (selected)** | Avg accuracy improvement per split | Understanding which features drive predictions |
| Weight | Number of times feature appears in trees | Feature selection / pruning |
| Cover | Avg number of samples affected per split | Dataset coverage analysis |

### 7.2 Fig 6 — Top 15 Features by Gain %

Horizontal bar chart of the top 15 features sorted by gain percentage. Each bar represents that feature's share of total model gain across all 200 trees. Colour gradient from red (highest importance) to green (lower importance).

### 7.3 Per-Enterprise Explanation

The `explain()` function takes a feature dict and returns the top-N most influential features for that specific enterprise with their actual values and importance percentages. This output maps to the `Risk_Explanation` table in the DB ER diagram.

**Output structure per factor:**

| Field | Description |
|-------|-------------|
| label | Human-readable feature name (e.g. "Climate Resilience Index [IMD]") |
| value | Actual value of the feature for this enterprise |
| importance | Feature's gain % from XGBoost importance |

---

## 8. Subsidy Matcher Module (SRS §12.5)

Rule-based, deterministic module completely independent from credit score computation. Evaluates farmer profiles against predefined eligibility criteria for 8 government schemes.

### 8.1 Design Characteristics

- **Rule-based and deterministic** — same input always produces same output
- **Independent from credit score** — runs separately, result not influenced by credit score
- **Modular** — new schemes can be added to the `SCHEMES` list without changing any logic
- **Scalable** — O(n × s) where n = enterprises, s = number of schemes

### 8.2 Input Parameters (SRS §12.5)

| Parameter | Source | Notes |
|-----------|--------|-------|
| enterprise_size | Farmer-provided | Small / Medium / Large |
| region | Farmer-provided | North / South / East / West |
| annual_revenue | Farmer-provided | ₹ thousands |
| landholding_size | Farmer-provided (web form) | Acres — not in dataset, simulated in notebook |
| crop_type | Farmer-provided (web form) | Not in dataset, simulated in notebook |
| irrigation_type | Farmer-provided (web form) | Not in dataset, simulated in notebook |

### 8.3 Matching Logic (SRS §12.5)

For each scheme, the matcher evaluates up to 7 conditions. A scheme is returned as eligible **only if ALL applicable conditions pass**.

| Condition | Check | SRS Reference |
|-----------|-------|---------------|
| Minimum landholding | `land >= min_land` | Check landholding criteria |
| Maximum landholding | `land <= max_land` | Check landholding criteria |
| Enterprise size | `ent in eligible_enterprise` | Validate enterprise size |
| Income threshold | `rev <= max_rev` | Check income threshold |
| Crop type | `crop in eligible_crops` | Validate crop-specific eligibility |
| Region | `region in eligible_regions` | Verify regional applicability |
| Irrigation type | `irr in irrigation_req` | Evaluate irrigation eligibility |

**Matching score** = conditions_passed / total_conditions_checked. Results sorted descending by score.

### 8.4 Government Schemes Database

| ID | Scheme Name | Key Eligibility | Benefit |
|----|------------|-----------------|---------|
| SS001 | PM Fasal Bima Yojana (PMFBY) | All farmers ≥ 0.5 acres | Up to ₹2 lakh crop loss compensation |
| SS002 | Kisan Credit Card (KCC) | Small/Medium, ≤ 10 acres, revenue ≤ ₹300K | Loan up to ₹3 lakh at 4% interest |
| SS003 | PM Kisan Samman Nidhi (PM-KISAN) | Small only, ≤ 2 acres, revenue ≤ ₹200K | ₹6,000/year in 3 instalments |
| SS004 | Per Drop More Crop (PDMC) | Specific crops, drip/sprinkler/rainfed irrigation, 1–20 acres | 55% subsidy on irrigation installation |
| SS005 | National Mission Sustainable Agri (NMSA) | East/West/South regions, ≥ 1 acre | Grants for climate adaptation and soil health |
| SS006 | Agricultural Infrastructure Fund (AIF) | Medium/Large, ≥ 2 acres | Loans up to ₹2 crore at 3% interest subvention |
| SS007 | Soil Health Card Scheme | All farmers ≥ 0.5 acres | Free soil testing, reduces input costs 10–15% |
| SS008 | National Food Security Mission (NFSM) | Small/Medium, North/East regions, food crops, ≤ 5 acres | Subsidised seeds, fertilisers, equipment |

### 8.5 Output Structure per Matched Scheme

| Field | Type | Description |
|-------|------|-------------|
| scheme_id | string | Unique identifier (e.g. SS001) |
| scheme_name | string | Full scheme name |
| benefits | string | What the farmer receives if approved |
| match_score | float [0, 1] | Fraction of conditions met |

### 8.6 Fig 7 — Subsidy Matching Results (1×2 panel)

- **Left:** Horizontal bar chart — how many enterprises are eligible per scheme
- **Right:** Histogram of number of eligible schemes per enterprise with mean annotation

---

## 9. Database Table Export (ER Diagram)

Four ML-output tables exported as CSVs with column names and ID formats matching the ER diagram exactly.

| Table | ER Diagram # | ID Format | Key Columns | Rows |
|-------|-------------|-----------|-------------|------|
| Feature_Vector | Table 5 | FV##### | feature_id, farmer_id, ERR, DSR, NPM, DE_ratio, CRI, TSI, MRI, encoded_enterprise_size, encoded_region, normalized_vector (JSON) | 4,981 |
| Credit_Assessment | Table 6 | CA##### | assessment_id, farmer_id, feature_id, probability_of_default, credit_score, risk_category, model_version, assessment_date | 4,981 |
| Risk_Explanation | Table 7 | EX##### | explanation_id, assessment_id, top_risk_increasing_factors (JSON), top_risk_reducing_factors (JSON), shap_values (JSON) | 4,981 |
| Subsidy_Match | Table 9 | SM###### | match_id, enterprise_id, scheme_id, scheme_name, eligibility_status, matching_score, evaluated_at | ~15,000+ |

**Tables not exported here** (populated by other system components):
- User, Farmer_Profile, Documents — populated by FastAPI backend from web form submissions
- External_Data — populated by climate/market API integration layer
- Subsidy_Scheme — pre-seeded in PostgreSQL from the `SCHEMES` list

---

## 10. End-to-End Inference Pipeline (SRS §18.2)

The `full_assessment()` function implements the complete SRS pipeline for a single new enterprise. This is the function called by the FastAPI backend at `/api/v1/full-assessment`.

### 10.1 Function Signature

```python
def full_assessment(inp: dict) -> dict
```

### 10.2 Input Dictionary

| Key | Type | Source | Default |
|-----|------|--------|---------|
| enterprise_size | str | Farmer-provided | 'Medium' |
| region | str | Farmer-provided | 'East' |
| quarter | str | Farmer-provided | 'Q1' |
| annual_revenue | float | Farmer-provided | required |
| annual_expenses | float | Farmer-provided | required |
| loan_amount | float | Farmer-provided | required |
| net_profit | float | Farmer-provided or auto-computed | rev − exp |
| debt_to_equity | float | Farmer-provided or auto-computed | loan / (rev × 2) |
| avg_temperature | float | IMD API | 25.0 |
| rainfall | float | IMD API | 200.0 |
| drought_index | float | NDMA API | 0.5 |
| flood_risk | float | NDMA API | 0.5 |
| commodity_price_index | float | AGMARKNET API | 100.0 |
| input_cost_index | float | Agri Ministry API | 100.0 |
| policy_support_score | int | Govt Policy DB | 2 |
| landholding_size | float | Farmer-provided | 1.0 |
| crop_type | str | Farmer-provided | '' |
| irrigation_type | str | Farmer-provided | '' |

### 10.3 Processing Steps

1. Unpack all input fields with safe defaults
2. Apply feature engineering pipeline (ERR, DSR, NPM, DE_ratio, CRI, TSI, MRI, encodings, stability indicators)
3. Build one-hot encoded region features
4. Reindex feature vector to match training column order — fill missing with 0
5. Call `xgb.predict_proba()` → P(default)
6. Compute `credit_score = (1 − P(default)) × 100`
7. Assign `risk_category` and `lending_recommendation` from score thresholds
8. Call `explain()` → top 5 features by XGBoost gain importance
9. Call `match_subsidies()` → list of eligible government schemes
10. Return combined result dict

### 10.4 Output Dictionary

| Key | Type | Description |
|-----|------|-------------|
| enterprise_id | str | Identifier from input |
| probability_of_default | float | XGBoost P(default) ∈ [0, 1] |
| credit_score | float | (1 − P) × 100, rounded to 2 dp |
| risk_category | str | "Low Risk" / "Medium Risk" / "High Risk" |
| lending_recommendation | str | Advisory text for loan officer |
| top_features | list[dict] | Top 5 features with label, value, importance % |
| eligible_subsidies | list[dict] | Matched schemes with scheme_id, name, benefits, match_score |
| model_version | str | "1.0-XGB" |
| assessed_at | str | ISO timestamp of assessment |

### 10.5 Saved Model Artefact — `xgboost_model.pkl`

| Key | Content |
|-----|---------|
| model | Trained XGBClassifier object |
| feature_names | Ordered list of all 27 feature column names |
| engineered_features | List of 13 SRS-engineered feature names |
| version | "1.0-XGB" |
| roc_auc | AUC score on test set at training time |
| f1 | F1 score on test set at training time |

---

## 11. Notebook Outputs

| File | Type | Description |
|------|------|-------------|
| fig1_eda.png | PNG | 6-panel EDA overview |
| fig2_correlation.png | PNG | Feature correlation heatmap |
| fig3_features.png | PNG | Engineered feature class separation (3×4) |
| fig4_model_comparison.png | PNG | ROC curves + metric comparison bars |
| fig5_credit_scores.png | PNG | Credit score dashboard + confusion matrix |
| fig6_feature_importance.png | PNG | Top 15 XGBoost gain features |
| fig7_subsidy.png | PNG | Subsidy coverage + schemes per enterprise |
| xgboost_model.pkl | Pickle | Trained XGBoost model + metadata |
| scored_dataset.csv | CSV | Full dataset with P_default, credit_score, risk_category |
| db_feature_vector.csv | CSV | ER Diagram Table 5 — Feature_Vector |
| db_credit_assessment.csv | CSV | ER Diagram Table 6 — Credit_Assessment |
| db_risk_explanation.csv | CSV | ER Diagram Table 7 — Risk_Explanation |
| db_subsidy_match.csv | CSV | ER Diagram Table 9 — Subsidy_Match |

---

## 12. Libraries & Dependencies

| Library | Version | Purpose |
|---------|---------|---------|
| pandas | 1.5+ | DataFrame operations, CSV I/O |
| numpy | 1.23+ | Numerical operations, array clipping |
| matplotlib | latest | All visualisation figures |
| seaborn | latest | Correlation heatmap |
| xgboost | 1.7+ | Primary ML model (SRS §10.1 requirement) |
| scikit-learn | 1.2+ | LR, RF, train_test_split, metrics, StandardScaler, StratifiedKFold |
| pickle | stdlib | Model serialisation |
| json | stdlib | JSON encoding for DB normalized_vector field |
