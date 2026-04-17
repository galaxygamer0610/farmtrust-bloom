import os
import sys

# Add project root to sys.path to allow imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from credit_score import CreditModel
import config
from feature_engineering import build_features_df, build_features_dict

def run_comparison():
    print("--- Model Comparison Test ---\n")
    
    # Load dataset
    df = pd.read_csv(config.DATASET_PATH)
    df_feat = build_features_df(df)
    
    rename_map = {
        'Revenue': 'annual_revenue', 'Expenses': 'annual_expenses',
        'Loan_Amount': 'loan_amount', 'Net_Profit': 'net_profit',
        'Avg_Temperature': 'avg_temperature', 'Rainfall': 'rainfall',
        'Drought_Index': 'drought_index', 'Flood_Risk_Score': 'flood_risk',
        'Commodity_Price_Index': 'commodity_price_index',
        'Input_Cost_Index': 'input_cost_index',
        'Policy_Support_Score': 'policy_support_score'
    }
    df_feat = df_feat.rename(columns=rename_map)
    
    X = df_feat[config.ALL_FEATURES]
    cm = CreditModel()
    y = cm._prepare_target(df)
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)
    
    # 1. Scaling for LR
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    
    pos_weight = (len(y_train) - sum(y_train)) / sum(y_train)
    
    print("Training models...")
    # 1. Logistic Regression
    lr = LogisticRegression(class_weight='balanced', max_iter=1000, random_state=42)
    lr.fit(X_train_scaled, y_train)
    
    # 2. Random Forest
    rf = RandomForestClassifier(n_estimators=100, class_weight='balanced', max_depth=8, random_state=42)
    rf.fit(X_train, y_train)
    
    # 3. XGBoost (Standard params for comparison)
    xb = xgb.XGBClassifier(
        n_estimators=126, max_depth=4, learning_rate=0.117, 
        subsample=0.91, colsample_bytree=0.93, scale_pos_weight=pos_weight,
        eval_metric='logloss', random_state=42
    )
    xb.fit(X_train, y_train)
    
    # Dummy Farmer Input for testing
    dummy_farmer = {
        "enterprise_id": "TEST-FARMER-001",
        "enterprise_size": "Medium",
        "state": "Maharashtra",
        "city": "Pune",
        "quarter": "Q1",
        "annual_revenue": 180.0,
        "annual_expenses": 140.0,
        "loan_amount": 60.0,
        "landholding_size": 3.0,
        "crop_type": "Wheat",
        "irrigation_type": "Canal",
        "yield_amount": 5.5,
        # Extra fields that usually come from API
        "avg_temperature": 26.5,
        "rainfall": 850.0,
        "drought_index": 0.3,
        "flood_risk": 0.1,
        "commodity_price_index": 120.0,
        "input_cost_index": 105.0,
        "policy_support_score": 3.0
    }
    
    feat_dict = build_features_dict(dummy_farmer)
    input_df = pd.DataFrame([feat_dict], columns=config.ALL_FEATURES).fillna(0)
    input_df_scaled = pd.DataFrame(scaler.transform(input_df), columns=config.ALL_FEATURES)
    
    # Get Probability of Default from each
    prob_lr = lr.predict_proba(input_df_scaled)[0][1]
    prob_rf = rf.predict_proba(input_df)[0][1]
    prob_xb = xb.predict_proba(input_df)[0][1]
    
    def get_score_risk(prob):
        score = (1 - prob) * 100
        category = "Low" if score >= 80 else "Medium" if score >= 50 else "High"
        return round(score, 2), category

    score_lr, risk_lr = get_score_risk(prob_lr)
    score_rf, risk_rf = get_score_risk(prob_rf)
    score_xb, risk_xb = get_score_risk(prob_xb)

    print("\n" + "="*50)
    print(f"{'Model Name':<25} | {'Prob Default':<12} | {'Credit Score':<12} | {'Risk'}")
    print("-" * 50)
    print(f"{'Logistic Regression':<25} | {prob_lr:<12.4f} | {score_lr:<12} | {risk_lr}")
    print(f"{'Random Forest':<25} | {prob_rf:<12.4f} | {score_rf:<12} | {risk_rf}")
    print(f"{'XGBoost':<25} | {prob_xb:<12.4f} | {score_xb:<12} | {risk_xb}")
    print("="*50)
    
    print("\nComparison complete. You can now manually review the differences.")

if __name__ == "__main__":
    run_comparison()
