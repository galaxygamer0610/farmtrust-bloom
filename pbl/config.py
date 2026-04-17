import os

# Base paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(BASE_DIR, 'AgriRiskFin_Dataset_Cleaned.csv')
MODEL_PATH = os.path.join(BASE_DIR, 'xgboost_model.pkl')

# Feature sets
RAW_NUMERIC_FEATURES = [
    'annual_revenue', 
    'annual_expenses', 
    'loan_amount', 
    'net_profit', 
    'avg_temperature', 
    'rainfall', 
    'drought_index', 
    'flood_risk', 
    'commodity_price_index', 
    'input_cost_index', 
    'policy_support_score'
]

ENGINEERED_FEATURES = [
    'ERR', 
    'DSR', 
    'NPM', 
    'DE_ratio', 
    'CRI', 
    'TSI', 
    'MRI', 
    'enterprise_enc', 
    'policy_norm', 
    'quarter_enc', 
    'financial_stability', 
    'leverage_risk', 
    'repayment_capacity',
    'rev_loss_risk',
    'profit_debt_ratio',
    'climate_index',
    'policy_benefit',
    'log_rev',
    'log_loan',
    'exp_risk',
    'landholding_size',
    'irrigation_enc',
    'yield_index'
]

OHE_FEATURES = [
    'region_North', 
    'region_South', 
    'region_West'
]

# The complete ordered list of 27 features required by XGBoost
ALL_FEATURES = RAW_NUMERIC_FEATURES + ENGINEERED_FEATURES + OHE_FEATURES

# Encodings mappings
ENTERPRISE_MAP = {"Small": 0, "Medium": 1, "Large": 2}
QUARTER_MAP = {"Q1": 0, "Q2": 1, "Q3": 2, "Q4": 3}
