import os
import sys
import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import f1_score

# Add project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from credit_score import CreditModel
import config
from feature_engineering import build_features_df

def check_overfitting():
    print("--- Detailed Overfitting Analysis (Train vs CV vs Test) ---\n")
    
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
    y = (df['Financial_Risk_Level'] == 'High').astype(int)
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)
    
    # --- INJECT LABEL NOISE (Match production) ---
    noise_ratio = 0.05
    n_fix = int(len(y_train) * noise_ratio)
    indices_to_flip = np.random.choice(range(len(y_train)), size=n_fix, replace=False)
    y_train.iloc[indices_to_flip] = 1 - y_train.iloc[indices_to_flip]

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    pos_weight = (len(y_train) - sum(y_train)) / sum(y_train)
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    models = [
        ('Logistic Regression (Scaled)', LogisticRegression(class_weight='balanced', max_iter=2000, random_state=42), True),
        ('Random Forest', RandomForestClassifier(n_estimators=100, class_weight='balanced', max_depth=10, random_state=42), False),
        ('XGBoost (Optimized)', xgb.XGBClassifier(
            max_depth=3, learning_rate=0.067, n_estimators=740, 
            subsample=0.74, colsample_bytree=0.86, colsample_bynode=0.40,
            min_child_weight=6, gamma=6e-06, alpha=5e-08, 
            scale_pos_weight=pos_weight, eval_metric='logloss', random_state=42
        ), False)
    ]

    print(f"{'Model Name':<30} | {'Train F1':<10} | {'CV F1 (Avg)':<12} | {'Test F1':<10} | {'Gap (Train-Test)'}")
    print("-" * 85)

    for name, model, use_scaled in models:
        X_tr = X_train_scaled if use_scaled else X_train
        X_te = X_test_scaled if use_scaled else X_test
        
        # Train F1
        model.fit(X_tr, y_train)
        train_preds = model.predict(X_tr)
        train_f1 = f1_score(y_train, train_preds)
        
        # CV F1
        cv_scores = cross_val_score(model, X_tr, y_train, cv=skf, scoring='f1')
        cv_f1 = np.mean(cv_scores)
        
        # Test F1
        test_preds = model.predict(X_te)
        test_f1 = f1_score(y_test, test_preds)
        
        gap = train_f1 - test_f1
        print(f"{name:<30} | {train_f1:<10.4f} | {cv_f1:<12.4f} | {test_f1:<10.4f} | {gap:.4f}")

    print("\nSummary Information:")
    print(f"- Total Samples: {len(df)}")
    print(f"- Noise Injected: {noise_ratio*100}% into Training Set")
    print(f"- Features Used: {len(config.ALL_FEATURES)} (including land size, yield, irrigation)")
    
    print("\nInterpretation:")
    print("1. If Train F1 >> CV/Test F1 (Gap > 0.05), the model is likely OVERFITTING.")
    print("2. If CV F1 is close to Test F1, the model generalizes well.")
    print("3. In your current run, Logistic Regression achieved exceptionally high scores on all sets, indicating the data is very well-separated.")

if __name__ == "__main__":
    check_overfitting()
