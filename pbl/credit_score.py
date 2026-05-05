import pandas as pd
import numpy as np
import xgboost as xgb
import pickle
import optuna
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
from feature_engineering import build_features_df, build_features_dict
from shap_explainer import get_shap_top_features
import config

class CreditModel:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.model_name = "Not Loaded"

    def _prepare_target(self, df):
        return (df['Financial_Risk_Level'] == 'High').astype(int)

    def evaluate_model(self, model, X_test, y_test, is_xgb=False):
        if is_xgb:
            preds = model.predict(X_test)
            probs = model.predict_proba(X_test)[:, 1]
        else:
            preds = model.predict(X_test)
            probs = model.predict_proba(X_test)[:, 1]
            
        return {
            'Accuracy':  accuracy_score(y_test, preds),
            'Precision': precision_score(y_test, preds, zero_division=0),
            'Recall':    recall_score(y_test, preds, zero_division=0),
            'F1':        f1_score(y_test, preds, zero_division=0),
            'ROC-AUC':   roc_auc_score(y_test, probs)
        }

    def train(self, dataset_path=config.DATASET_PATH, model_output_path=config.MODEL_PATH, noise_ratio=0.05):
        df = pd.read_csv(dataset_path)
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
        y = self._prepare_target(df)
        
        # --- INJECT LABEL NOISE (For realism) ---
        if noise_ratio > 0:
            n_fix = int(len(y) * noise_ratio)
            indices_to_flip = np.random.choice(range(len(y)), size=n_fix, replace=False)
            y.iloc[indices_to_flip] = 1 - y.iloc[indices_to_flip]
            print(f"Injected {noise_ratio*100}% label noise: Flipped {n_fix} labels for realism.")
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)
        
        # 1. Scaling Numerical Features (Crucial for Logistic Regression and SVM)
        self.scaler = StandardScaler()
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        pos_weight = (len(y_train) - sum(y_train)) / sum(y_train)
        skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

        print("\n--- Training Evaluated Models with 5-Fold Cross-Validation ---")
        model_results = []
        
        # 1. Logistic Regression
        lr = LogisticRegression(class_weight='balanced', max_iter=2000, random_state=42)
        cv_scores = cross_val_score(lr, X_train_scaled, y_train, cv=skf, scoring='recall')
        avg_recall = np.mean(cv_scores)
        lr.fit(X_train_scaled, y_train)
        lr_metrics = self.evaluate_model(lr, X_test_scaled, y_test)
        print(f"Logistic Regression: CV Recall = {avg_recall:.4f}, Test Recall = {lr_metrics['Recall']:.4f}")
        model_results.append({'model': lr, 'name': 'Logistic Regression', 'cv_recall': avg_recall})
        
        # 2. Random Forest
        rf = RandomForestClassifier(n_estimators=100, class_weight='balanced', max_depth=10, random_state=42)
        cv_scores = cross_val_score(rf, X_train, y_train, cv=skf, scoring='recall')
        avg_recall = np.mean(cv_scores)
        rf.fit(X_train, y_train)
        rf_metrics = self.evaluate_model(rf, X_test, y_test)
        print(f"Random Forest: CV Recall = {avg_recall:.4f}, Test Recall = {rf_metrics['Recall']:.4f}")
        model_results.append({'model': rf, 'name': 'Random Forest', 'cv_recall': avg_recall})

        # 3. XGBoost with Optuna
        print("\nStarting Optuna Hyperparameter Tuning for XGBoost (50 Trials)...")
        
        def objective(trial):
            param = {
                'max_depth': trial.suggest_int('max_depth', 3, 11),
                'learning_rate': trial.suggest_float('learning_rate', 0.005, 0.4, log=True),
                'n_estimators': trial.suggest_int('n_estimators', 200, 800),
                'subsample': trial.suggest_float('subsample', 0.5, 1.0),
                'colsample_bytree': trial.suggest_float('colsample_bytree', 0.4, 1.0),
                'colsample_bynode': trial.suggest_float('colsample_bynode', 0.4, 1.0),
                'min_child_weight': trial.suggest_int('min_child_weight', 1, 20),
                'gamma': trial.suggest_float('gamma', 1e-8, 10.0, log=True),
                'alpha': trial.suggest_float('alpha', 1e-8, 10.0, log=True),
                'lambda': trial.suggest_float('lambda', 1e-8, 10.0, log=True),
                'scale_pos_weight': pos_weight,
                'eval_metric': 'logloss',
                'random_state': 42
            }
            # Use CV inside Optuna to find best generalization for RECALL
            xgb_temp = xgb.XGBClassifier(**param)
            cv_scores = cross_val_score(xgb_temp, X_train, y_train, cv=skf, scoring='recall')
            return np.mean(cv_scores)

        try:
            optuna.logging.set_verbosity(optuna.logging.WARNING)
            study = optuna.create_study(direction='maximize')
            study.optimize(objective, n_trials=50, timeout=300)
            best_params = study.best_params
            best_params['scale_pos_weight'] = pos_weight
            best_params['eval_metric'] = 'logloss'
            best_params['random_state'] = 42
            print("Optuna tuned params:", best_params)
            xgb_final = xgb.XGBClassifier(**best_params)
        except Exception as e:
            print(f"Optuna failed: {e}. Using fixed fallback XGBoost parameters.")
            xgb_final = xgb.XGBClassifier(
                n_estimators=300, max_depth=6, learning_rate=0.05,
                subsample=0.8, colsample_bytree=0.8, scale_pos_weight=pos_weight,
                eval_metric='logloss', random_state=42
            )
            
        xgb_final.fit(X_train, y_train)
        
        # --- THRESHOLD OPTIMIZATION FOR XGBOOST ---
        val_probs = xgb_final.predict_proba(X_test)[:, 1]
        best_threshold = 0.5
        best_recall = 0
        for thresh in np.arange(0.1, 0.9, 0.01):
            rec = recall_score(y_test, (val_probs > thresh).astype(int))
            if rec > best_recall:
                best_recall = rec
                best_threshold = thresh
        
        print(f"Optimal XGBoost Threshold (Recall Optimized): {best_threshold:.2f} (resulting in Recall: {best_recall:.4f})")
        
        cv_scores = cross_val_score(xgb_final, X_train, y_train, cv=skf, scoring='recall')
        avg_recall = np.mean(cv_scores)
        print(f"XGBoost: CV Recall = {avg_recall:.4f}, Test Recall (optimal thresh) = {best_recall:.4f}")
        model_results.append({'model': xgb_final, 'name': 'XGBoost', 'cv_recall': avg_recall, 'threshold': best_threshold})

        # --- SELECT BEST MODEL BASED ON CV RECALL PERFORMANCE ---
        best_candidate = max(model_results, key=lambda x: x['cv_recall'])
        self.model = best_candidate['model']
        self.model_name = best_candidate['name']
        self.threshold = best_candidate.get('threshold', 0.5)
        print(f"\n>>> Selected {self.model_name} as the best model based on {skf.n_splits}-fold CV Recall score: {best_candidate['cv_recall']:.4f}")
        
        save_data = {
            'model': self.model,
            'model_name': self.model_name,
            'scaler': self.scaler,
            'threshold': self.threshold
        }
        with open(model_output_path, 'wb') as f:
            pickle.dump(save_data, f)
        print(f"Optimal model and parameters serialized to {model_output_path}")

    def load_model(self, model_path=config.MODEL_PATH):
        with open(model_path, 'rb') as f:
            data = pickle.load(f)
            if isinstance(data, dict):
                self.model = data['model']
                self.model_name = data['model_name']
                self.scaler = data.get('scaler')
                self.threshold = data.get('threshold', 0.5)
            else:
                # Backward compatibility
                self.model = data
                self.model_name = "XGBoost (Legacy)"
                self.scaler = None
                self.threshold = 0.5

    def calculate_credit_score_and_risk(self, farmer_data: dict) -> dict:
        if self.model is None:
            print("DEBUG: Model is None, loading model...")
            self.load_model()
        
        print(f"DEBUG: Model loaded: {self.model_name}")
        print(f"DEBUG: Input data keys: {farmer_data.keys()}")
            
        feat_dict = build_features_dict(farmer_data)
        print(f"DEBUG: Feature dict sample: {list(feat_dict.items())[:5]}")
        
        input_df = pd.DataFrame([feat_dict], columns=config.ALL_FEATURES).fillna(0)
        print(f"DEBUG: Input shape: {input_df.shape}")
        print(f"DEBUG: Input sample:\n{input_df.iloc[0][:10]}")
        
        # Apply scaling if the selected model is Logistic Regression
        if self.model_name == "Logistic Regression" and self.scaler:
            input_df = pd.DataFrame(self.scaler.transform(input_df), columns=config.ALL_FEATURES)
            
        prob_default = self.model.predict_proba(input_df)[0][1]
        
        # Debug logging
        print(f"DEBUG: prob_default = {prob_default}")
        print(f"DEBUG: Model name = {self.model_name}")
        print(f"DEBUG: Threshold = {self.threshold}")
        
        # Use optimized threshold for classification
        prediction = 1 if prob_default >= self.threshold else 0
        credit_score = (1 - prob_default) * 100
        
        print(f"DEBUG: credit_score = {credit_score}")
        
        if credit_score >= 80:
            category, rec = "Low Risk", "Eligible - proceed with standard loan terms"
        elif credit_score >= 50:
            category, rec = "Medium Risk", "Conditional - reduced amount or additional review"
        else:
            category, rec = "High Risk", "High risk - flag for manual review before approval"
        
        # Calculate eligibility score (Harvest Score)
        eligibility_score = self.calculate_eligibility_score(feat_dict, prob_default)
        
        # Calculate eligible loan amount
        requested_amount = farmer_data.get('loan_amount', 0)
        eligible_amount = requested_amount * eligibility_score
            
        # Get top features using SHAP
        top_features = get_shap_top_features(self.model, self.model_name, self.scaler, feat_dict, top_k=5)
            
        return {
            "probability_of_default": round(float(prob_default), 4),
            "credit_score": round(float(credit_score), 2),
            "risk_category": category,
            "lending_recommendation": rec,
            "eligibility_score": round(float(eligibility_score), 4),
            "eligible_amount": round(float(eligible_amount), 2),
            "requested_amount": round(float(requested_amount), 2),
            "top_features": top_features,
            "selected_model": self.model_name
        }
    
    def calculate_eligibility_score(self, feat_dict: dict, prob_default: float) -> float:
        """
        Calculate loan eligibility score (Harvest Score) based on financial metrics
        
        Formula:
        Eligibility Score = (0.40 × repayment_capacity) + 
                           (0.30 × financial_stability) + 
                           (0.15 × (1 - leverage_risk)) + 
                           (0.15 × (1 - risk_score))
        
        Where:
        - repayment_capacity: Ability to repay based on profit margins (0-1)
        - financial_stability: Overall financial health (0-1)
        - leverage_risk: Debt burden relative to equity (0-1, lower is better)
        - risk_score: Probability of default from ML model (0-1, lower is better)
        
        Returns: Score between 0 and 1 (multiply by 100 for percentage)
        """
        # Extract engineered features (already calculated in feat_dict)
        repayment_capacity = feat_dict.get('repayment_capacity', 0.5)
        financial_stability = feat_dict.get('financial_stability', 0.5)
        leverage_risk = feat_dict.get('leverage_risk', 0.5)
        risk_score = prob_default  # Use ML model's probability of default
        
        # Calculate weighted eligibility score
        eligibility = (
            0.40 * repayment_capacity +
            0.30 * financial_stability +
            0.15 * (1 - leverage_risk) +
            0.15 * (1 - risk_score)
        )
        
        # Clamp to valid range [0, 1]
        eligibility = np.clip(eligibility, 0, 1)
        
        return float(eligibility)

    def get_top_features(self, feat_dict: dict, top_k: int = 5) -> list:
        if self.model is None:
            self.load_model()
            
        if hasattr(self.model, 'feature_importances_'):
            importances = self.model.feature_importances_
        elif hasattr(self.model, 'coef_'):
            # For Logistic Regression, use absolute coefficients
            importances = np.abs(self.model.coef_[0])
            importances = importances / np.sum(importances) # Normalize to 0-1 scale
        else:
            importances = np.zeros(len(config.ALL_FEATURES))

        feat_imp = list(zip(config.ALL_FEATURES, importances))
        feat_imp.sort(key=lambda x: x[1], reverse=True)
        
        top_features = []
        for feature_name, importance in feat_imp[:top_k]:
            top_features.append({
                "label": feature_name,
                "value": round(feat_dict.get(feature_name, 0.0), 3),
                "importance": round(float(importance * 100), 2)
            })
        return top_features
