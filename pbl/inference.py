import asyncio
from datetime import datetime
import uuid
from credit_score import CreditModel
from subsidy_matcher import match_subsidies
from api_fetcher import fetch_external_data, fetch_available_schemes

_model_instance = None

def get_credit_model():
    """Lazy load the XGBoost prediction model singleton."""
    global _model_instance
    if _model_instance is None:
        _model_instance = CreditModel()
        _model_instance.load_model()
    return _model_instance

async def full_assessment(inp: dict) -> dict:
    """
    Implements the complete async ML pipeline for a single new enterprise.
    1. Fetches external Data APIs & Government Scheme Registries dynamically.
    2. Merges Farmer Inputs with API derivations.
    3. Triggers Feature Engineering & ML prediction (XGBoost).
    4. Routes to Subsidy matching logic against the fetched registry.
    """
    enterprise_id = inp.get('enterprise_id', str(uuid.uuid4()))
    state = inp.get('state', 'Maharashtra')
    city = inp.get('city', 'Pune')
    crop_type = inp.get('crop_type', 'Wheat')
    
    # -------------------------------------------------------------
    # STEP 1: ASYNC API FETCHING (DATA + SCHEMES CONCURRENTLY)
    # Fetch real climate indices AND the dynamic subsidy schema.
    # -------------------------------------------------------------
    api_data_task = fetch_external_data(state, city, crop_type)
    api_schemes_task = fetch_available_schemes()
    
    # Run them absolutely parallel for max speed
    api_data, available_schemes = await asyncio.gather(api_data_task, api_schemes_task)
    
    # Merge API dataset into the working dictionary natively
    inp.update(api_data)
    
    # -------------------------------------------------------------
    # STEP 2: ENSURE BASELINE FARMER INPUTS
    # -------------------------------------------------------------
    inp['annual_revenue'] = inp.get('annual_revenue', 100.0) 
    inp['annual_expenses'] = inp.get('annual_expenses', 50.0)
    inp['loan_amount'] = inp.get('loan_amount', 0.0)
    
    # -------------------------------------------------------------
    # STEP 3: PREDICTION ENGINE & EXPERT SYSTEM
    # -------------------------------------------------------------
    cm = get_credit_model()
    credit_results = cm.calculate_credit_score_and_risk(inp)
    
    # Pass the DYNAMICALLY fetch schemes JSON directly into our engine
    matched_subsidies = match_subsidies(inp, available_schemes)
    
    # -------------------------------------------------------------
    # STEP 4: RETURN CONSOLIDATED PAYLOAD
    # -------------------------------------------------------------
    output = {
        "enterprise_id": enterprise_id,
        "probability_of_default": credit_results["probability_of_default"],
        "credit_score": credit_results["credit_score"],
        "risk_category": credit_results["risk_category"],
        "lending_recommendation": credit_results["lending_recommendation"],
        "top_features": credit_results["top_features"],
        "eligible_subsidies": matched_subsidies,
        "selected_model": credit_results["selected_model"],
        "model_version": "1.2-Dynamic-Matcher",
        "assessed_at": datetime.utcnow().isoformat() + "Z"
    }
    
    return output

if __name__ == '__main__':
    print("Testing Async ML Inference Pipeline explicitly calling REAL APIs for Data AND Schemes...")
    
    dummy_farmer = {
        "enterprise_id": "FARM-TEST-DYNAMIC-03",
        "enterprise_size": "Small",
        "state": "Maharashtra",
        "city": "Pune",
        "quarter": "Q2",
        "annual_revenue": 150.0,
        "annual_expenses": 120.0,
        "loan_amount": 50.0,
        "landholding_size": 2.5,
        "crop_type": "Wheat",
        "irrigation_type": "Canal"
    }
    
    async def run_test():
        try:
            result = await full_assessment(dummy_farmer)
            import json
            print(json.dumps(result, indent=2))
            print("\nTest completed successfully!")
        except Exception as e:
            print(f"Error during async inference test: {e}")
            
    asyncio.run(run_test())
