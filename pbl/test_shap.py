import json
from credit_score import CreditModel
from feature_engineering import build_features_dict
from shap_explainer import get_shap_top_features

def test_shap():
    print("Loading model...")
    cm = CreditModel()
    cm.load_model()
    print(f"Model loaded: {cm.model_name}")

    # Create dummy farmer data
    dummy_farmer = {
        "enterprise_id": "FARM-SHAP-TEST",
        "enterprise_size": "Small",
        "state": "Maharashtra",
        "city": "Pune",
        "quarter": "Q2",
        "annual_revenue": 150.0,
        "annual_expenses": 120.0,
        "loan_amount": 50.0,
        "landholding_size": 2.5,
        "crop_type": "Wheat",
        "irrigation_type": "Canal",
        # Extra fields API might provide
        "avg_temperature": 25.0,
        "rainfall": 100.0,
        "drought_index": 0.2,
        "flood_risk": 0.1,
    }

    print("Building features...")
    feat_dict = build_features_dict(dummy_farmer)

    print("Getting default top features (from CreditModel)...")
    default_top = cm.get_top_features(feat_dict, top_k=5)
    print(json.dumps(default_top, indent=2))

    print("\nGetting SHAP top features...")
    shap_top = get_shap_top_features(cm.model, cm.model_name, cm.scaler, feat_dict, top_k=5)
    print(json.dumps(shap_top, indent=2))

if __name__ == "__main__":
    test_shap()
