"""
shap_explainer.py
=================
Drop-in SHAP replacement for CreditModel.get_top_features().

Returns the exact same format:
    [{"label": str, "value": float, "importance": float (%)}, ...]

Usage (from credit_score.py or anywhere):
    from shap_explainer import get_shap_top_features
    top = get_shap_top_features(self.model, self.model_name, self.scaler, feat_dict)
"""

import numpy as np
import pandas as pd
import shap
import config


def get_shap_top_features(model, model_name: str, scaler, feat_dict: dict, top_k: int = 5) -> list:
    """
    Computes per-prediction SHAP values and returns the top-k driving features.

    Args:
        model:       The trained model object (XGBoost, RandomForest, or LogisticRegression).
        model_name:  String name of the model (used to detect LR for scaling).
        scaler:      StandardScaler instance, or None.
        feat_dict:   Engineered feature dict for one farmer (output of build_features_dict).
        top_k:       How many top features to return (default 5, same as current logic).

    Returns:
        List of dicts: [{"label": ..., "value": ..., "importance": ...}, ...]
        - "label"      : feature name
        - "value"      : actual feature value for this farmer
        - "importance" : SHAP contribution as a % of total absolute SHAP (0-100)
    """
    # --- Build the input row ---
    X = pd.DataFrame([feat_dict], columns=config.ALL_FEATURES).fillna(0)

    # Apply scaler only for Logistic Regression (same logic as inference)
    if model_name == "Logistic Regression" and scaler is not None:
        X_input = pd.DataFrame(scaler.transform(X), columns=config.ALL_FEATURES)
    else:
        X_input = X

    # --- Pick the right SHAP explainer ---
    # TreeExplainer: exact & fast for XGBoost / RandomForest, needs no background data.
    # LinearExplainer: exact for LogisticRegression, uses zero-baseline masker.
    from sklearn.linear_model import LogisticRegression as LR

    if isinstance(model, LR):
        # Zero baseline: SHAP values show deviation from predicting on all-zero input.
        # Good enough for a relative ranking between features.
        # Create a zero-filled dataframe as the background/masker
        X_background = pd.DataFrame(np.zeros((1, X_input.shape[1])), columns=X_input.columns)
        masker = shap.maskers.Independent(X_background, max_samples=1)
        explainer = shap.LinearExplainer(model, masker)
    else:
        # TreeExplainer works directly on XGBoost / RandomForest without background.
        explainer = shap.TreeExplainer(model)

    raw = explainer.shap_values(X_input)

    # Binary classifiers return [class_0_vals, class_1_vals] — we want class 1 (default risk).
    # XGBoost TreeExplainer returns a single 2D array instead of a list.
    if isinstance(raw, list):
        shap_row = raw[1][0]   # class 1, first (only) row
    else:
        shap_row = raw[0]      # XGBoost: single array, first row

    # --- Convert to same percentage format as get_top_features() ---
    abs_vals = np.abs(shap_row)
    total = abs_vals.sum()
    # Normalize so importances sum to 1 (then * 100 for %)
    importances = abs_vals / total if total > 0 else abs_vals

    feat_imp = sorted(zip(config.ALL_FEATURES, importances), key=lambda x: x[1], reverse=True)

    return [
        {
            "label": feat,
            "value": round(float(feat_dict.get(feat, 0.0)), 3),
            "importance": round(float(imp * 100), 2)
        }
        for feat, imp in feat_imp[:top_k]
    ]
