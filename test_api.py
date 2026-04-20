"""
Quick test script for the ML microservice
"""

import requests
import json

# Test data matching backend payload structure
test_payload = {
    "enterprise_id": "FARM-TEST-001",
    "enterprise_size": "Small",
    "region": "West",
    "quarter": "Q2",
    "annual_revenue": 150.0,
    "annual_expenses": 120.0,
    "loan_amount": 50.0,
    "net_profit": 30.0,
    "debt_to_equity": 0.167,
    "avg_temperature": 25.0,
    "rainfall": 200.0,
    "drought_index": 0.3,
    "flood_risk": 0.2,
    "commodity_price_index": 105.0,
    "input_cost_index": 100.0,
    "policy_support_score": 2,
    "landholding_size": 2.5,
    "crop_type": "Wheat",
    "irrigation_type": "Canal",
    "yield_amount": 5.0
}

def test_health():
    """Test health endpoint"""
    print("Testing /health endpoint...")
    try:
        response = requests.get("http://localhost:8001/health")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_predict():
    """Test predict endpoint"""
    print("\nTesting /predict endpoint...")
    try:
        response = requests.post(
            "http://localhost:8001/predict",
            json=test_payload,
            headers={"Content-Type": "application/json"}
        )
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"\n✅ Prediction successful!")
            print(f"Enterprise ID: {result['enterprise_id']}")
            print(f"Credit Score: {result['credit_score']}")
            print(f"Risk Category: {result['risk_category']}")
            print(f"Recommendation: {result['lending_recommendation']}")
            print(f"\nTop Features:")
            for feat in result['top_features'][:3]:
                print(f"  - {feat['label']}: {feat['value']} (importance: {feat['importance']}%)")
            print(f"\nEligible Subsidies: {len(result['eligible_subsidies'])}")
            return True
        else:
            print(f"Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_model_info():
    """Test model info endpoint"""
    print("\nTesting /model/info endpoint...")
    try:
        response = requests.get("http://localhost:8001/model/info")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("FarmTrust ML Microservice - API Test")
    print("=" * 60)
    
    # Run tests
    health_ok = test_health()
    predict_ok = test_predict()
    model_ok = test_model_info()
    
    # Summary
    print("\n" + "=" * 60)
    print("Test Summary:")
    print(f"  Health Check: {'✅ PASS' if health_ok else '❌ FAIL'}")
    print(f"  Prediction: {'✅ PASS' if predict_ok else '❌ FAIL'}")
    print(f"  Model Info: {'✅ PASS' if model_ok else '❌ FAIL'}")
    print("=" * 60)
    
    if all([health_ok, predict_ok, model_ok]):
        print("\n🎉 All tests passed! Microservice is working correctly.")
    else:
        print("\n⚠️ Some tests failed. Check the errors above.")
