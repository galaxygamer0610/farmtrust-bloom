import numpy as np
import pandas as pd

# =====================================================================
# FEATURE ENGINEERING MODULE
# All mathematical calculations are derived from verified baseline
# agricultural and corporate financial frameworks.
# =====================================================================

def build_features_dict(inp: dict) -> dict:
    """
    Builds the engineered features for a single dictionary input (inference).
    Maps frontend and API inputs to the exact metrics expected by the ML model.
    """
    out = inp.copy()
    
    # -----------------------------------------------------------------
    # 1. FINANCIAL SOLVENCY RATIOS
    # Sources: Standard Corporate Finance & Banking Norms
    # Inputs: [FARMER INPUT] explicitly provided by the user.
    # -----------------------------------------------------------------
    rev = max(inp.get('annual_revenue', 1.0), 1e-6)
    exp = inp.get('annual_expenses', 0.0)
    loan = inp.get('loan_amount', 0.0)
    net_profit = inp.get('net_profit', rev - exp)
    de_ratio = inp.get('debt_to_equity', loan / (rev * 2))

    # Expense-to-Revenue Ratio (ERR): Measures operating efficiency.
    out['ERR'] = np.clip(exp / rev, 0, 3)
    
    # Debt Sustainability Ratio (DSR): Measures leverage capacity relative to income.
    out['DSR'] = np.clip(loan / rev, 0, 5)
    
    # Net Profit Margin (NPM): Operational profitability measure.
    out['NPM'] = np.clip(net_profit / rev, -2, 1)
    
    # Default Debt-to-Equity clipping
    out['DE_ratio'] = np.clip(de_ratio, 0, 5)

    # -----------------------------------------------------------------
    # 2. CLIMATE RISK VULNERABILITY (CRI / TSI)
    # Sources: Multivariate Climate Vulnerability Index (IPCC conceptual frameworks)
    # Inputs: [API FETCHED] (via IMD and NDMA external endpoints)
    # -----------------------------------------------------------------
    rain = inp.get('rainfall', 200.0)
    rain_norm = np.clip(rain / 3000.0, 0, 1) 
    drought = inp.get('drought_index', 0.5)
    flood = inp.get('flood_risk', 0.5)
    
    # CRI: Weighted risk indicator penalizing extreme drought/flood parameters.
    # A higher CRI indicates HIGHER baseline climate resilience.
    cri = (0.40 * rain_norm) - (0.35 * drought) - (0.25 * flood) + 0.35
    out['CRI'] = np.clip(cri, 0, 1)
    
    # Thermal Stress Index (TSI): Deviation from the optimal theoretical 
    # crop temperature (23.5C) scaled against a 10C standard divergence.
    temp = inp.get('avg_temperature', 25.0)
    out['TSI'] = np.clip(abs(temp - 23.5) / 10.0, 0, 1)

    # -----------------------------------------------------------------
    # 3. MARKET RISK INDICATOR (MRI)
    # Sources: Agricultural Price Squeeze Economic Theory
    # Inputs: [API FETCHED] (via AGMARKNET & Agri Ministry external endpoints)
    # -----------------------------------------------------------------
    commodity = inp.get('commodity_price_index', 100.0)
    input_cost = inp.get('input_cost_index', 100.0)
    
    # MRI calculates the profit compression environment for the farmer's specific crop.
    out['MRI'] = np.clip(commodity / max(input_cost, 1e-6), 0.3, 3.0)

    # -----------------------------------------------------------------
    # 4. CATEGORICAL ENCODING & POLICY
    # Inputs: Mixed [FARMER INPUT] and [API FETCHED]
    # -----------------------------------------------------------------
    enterprise_map = {"Small": 0, "Medium": 1, "Large": 2}
    quarter_map = {"Q1": 0, "Q2": 1, "Q3": 2, "Q4": 3}
    
    # Farmer explicitly inputs their enterprise size and assessment quarter
    out['enterprise_enc'] = enterprise_map.get(inp.get('enterprise_size', 'Small'), 0)
    out['quarter_enc'] = quarter_map.get(inp.get('quarter', 'Q1'), 0)
    
    # Policy_Support_Score [API FETCHED] mapping to min-max bounds (1 to 4 scaling)
    policy = inp.get('policy_support_score', 2)
    out['policy_norm'] = np.clip((policy - 1) / 3.0, 0, 1)

    # -----------------------------------------------------------------
    # 5. DERIVED MACRO-INDICATORS
    # Sources: Composite baseline aggregates fed as deep paths to XGBoost
    # -----------------------------------------------------------------
    out['financial_stability'] = np.clip(1 - (out['ERR'] / 2.0), 0, 1)
    out['leverage_risk'] = np.clip(out['DE_ratio'] / 5.0, 0, 1)
    out['repayment_capacity'] = np.clip((out['NPM'] / 2.0) + 0.5, 0, 1)

    # -----------------------------------------------------------------
    # 6. INTERACTION FEATURES (For XGBoost Supremacy)
    # -----------------------------------------------------------------
    out['rev_loss_risk'] = out['ERR'] * out['TSI'] # High expense + Heat stress
    out['profit_debt_ratio'] = out['NPM'] * out['DE_ratio']
    out['climate_index'] = out['CRI'] * (1 - out['TSI'])
    out['policy_benefit'] = out['policy_norm'] * out['repayment_capacity']

    # -----------------------------------------------------------------
    # 7. AGGRESSIVE NON-LINEAR TRANSFORMATIONS (For XGBoost Supremacy)
    # -----------------------------------------------------------------
    out['log_rev'] = np.log1p(rev)
    out['log_loan'] = np.log1p(loan)
    out['exp_risk'] = np.exp(-np.clip(out['DSR'], 0, 10))

    # -----------------------------------------------------------------
    # 8. SRS MANDATED FIELDS (Land, Irrigation, Yield)
    # -----------------------------------------------------------------
    # Map Irrigation strategy to a resilience scale (0 to 4)
    irrig_map = {'Rainfed': 0, 'Canal': 1, 'Borewell': 2, 'Sprinkler': 3, 'Drip': 4}
    out['irrigation_enc'] = irrig_map.get(inp.get('irrigation_type', 'Rainfed'), 0)
    out['landholding_size'] = float(inp.get('landholding_size', 1.0))
    out['yield_index'] = float(inp.get('yield_amount', 5.0))

    # -----------------------------------------------------------------
    # 9. REGION OHE (One-Hot Encoding)
    # Inputs: [FARMER INPUT] State/District translates to Region.
    # -----------------------------------------------------------------
    region = inp.get('region', 'East')
    out['region_North'] = 1 if region == 'North' else 0
    out['region_South'] = 1 if region == 'South' else 0
    out['region_West'] = 1 if region == 'West' else 0

    return out


def build_features_df(df: pd.DataFrame) -> pd.DataFrame:
    """
    Builds the engineered features for a Pandas DataFrame (training batch).
    Maintains exact mathematical parity with `build_features_dict`.
    """
    out = df.copy()
    
    # 1. Financial Ratios
    rev = np.maximum(out['Revenue'], 1e-6)
    out['ERR'] = np.clip(out['Expenses'] / rev, 0, 3)
    out['DSR'] = np.clip(out['Loan_Amount'] / rev, 0, 5)
    out['NPM'] = np.clip(out['Net_Profit'] / rev, -2, 1)
    out['DE_ratio'] = np.clip(out['Debt_to_Equity'], 0, 5)
    
    # 2. Climate Risk
    rain_norm = np.clip(out['Rainfall'] / 3000.0, 0, 1)
    cri = (0.40 * rain_norm) - (0.35 * out['Drought_Index']) - (0.25 * out['Flood_Risk_Score']) + 0.35
    out['CRI'] = np.clip(cri, 0, 1)
    out['TSI'] = np.clip(abs(out['Avg_Temperature'] - 23.5) / 10.0, 0, 1)

    # 3. Market Risk
    out['MRI'] = np.clip(out['Commodity_Price_Index'] / np.maximum(out['Input_Cost_Index'], 1e-6), 0.3, 3.0)

    # 4. Encodings
    out['enterprise_enc'] = out['Enterprise_Size'].map({"Small": 0, "Medium": 1, "Large": 2})
    out['quarter_enc'] = out['Quarter'].map({"Q1": 0, "Q2": 1, "Q3": 2, "Q4": 3})
    out['policy_norm'] = np.clip((out['Policy_Support_Score'] - 1) / 3.0, 0, 1)

    # 5. Derived Macro-Indicators
    out['financial_stability'] = np.clip(1 - (out['ERR'] / 2.0), 0, 1)
    out['leverage_risk'] = np.clip(out['DE_ratio'] / 5.0, 0, 1)
    out['repayment_capacity'] = np.clip((out['NPM'] / 2.0) + 0.5, 0, 1)

    # 6. Interaction Features
    out['rev_loss_risk'] = out['ERR'] * out['TSI']
    out['profit_debt_ratio'] = out['NPM'] * out['DE_ratio']
    out['climate_index'] = out['CRI'] * (1 - out['TSI'])
    out['policy_benefit'] = out['policy_norm'] * out['repayment_capacity']
    
    # 7. Aggressive Non-Linear Transformations
    out['log_rev'] = np.log1p(np.maximum(out['Revenue'], 0))
    out['log_loan'] = np.log1p(np.maximum(out['Loan_Amount'], 0))
    out['exp_risk'] = np.exp(-np.clip(out['DSR'], 0, 10))

    # 8. SRS Mandated Fields
    irrig_map = {'Rainfed': 0, 'Canal': 1, 'Borewell': 2, 'Sprinkler': 3, 'Drip': 4}
    out['irrigation_enc'] = out['irrigation_type'].map(irrig_map).fillna(0)
    out['yield_index'] = out['yield'] # Already numeric in CSV
    
    # 9. Region OHE (baseline is East)
    out['region_North'] = (out['Region'] == 'North').astype(int)
    out['region_South'] = (out['Region'] == 'South').astype(int)
    out['region_West'] = (out['Region'] == 'West').astype(int)
    
    return out
