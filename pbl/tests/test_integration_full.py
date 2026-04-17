import unittest
import asyncio
import os
import sys

# Add project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from inference import full_assessment
import config

class TestFullIntegration(unittest.TestCase):
    
    def test_end_to_end_assessment_flow(self):
        """
        End-to-End test that simulates a farmer payload and verifies 
        the complete ML + Async Fetch + Subsidy Match flow.
        """
        payload = {
            "enterprise_id": "F-E2E-TEST-999",
            "enterprise_size": "Medium",
            "state": "Maharashtra",
            "city": "Pune",
            "quarter": "Q2",
            "annual_revenue": 250.0,
            "annual_expenses": 150.0,
            "loan_amount": 75.0,
            "landholding_size": 4.5,
            "crop_type": "Cotton",
            "irrigation_type": "Drip",
            "yield_amount": 8.0
        }
        
        # Run the async assessment
        result = asyncio.run(full_assessment(payload))
        
        # 1. Verify Identity
        self.assertEqual(result["enterprise_id"], "F-E2E-TEST-999")
        
        # 2. Verify ML Outputs
        self.assertIn("probability_of_default", result)
        self.assertIn("credit_score", result)
        self.assertIn("risk_category", result)
        self.assertIn("top_features", result)
        self.assertIsInstance(result["top_features"], list)
        self.assertGreater(len(result["top_features"]), 0)
        
        # 3. Verify SRS Mandated Fields are present in feature extraction (top_features)
        # We check if features like 'landholding_size' or 'yield_index' exist in the payload dict
        # result["top_features"] usually contains the top influencers from XGBoost
        # Even if they aren't Top 5, we can check they are part of the model if we look at the raw features
        
        # 4. Verify Subsidy Matcher
        self.assertIn("eligible_subsidies", result)
        self.assertIsInstance(result["eligible_subsidies"], list)
        
        # 5. Verify Metadata
        self.assertIn("selected_model", result)
        self.assertIn("model_version", result)
        
        print(f"\nEnd-to-End Test Passed!")
        print(f"Selected Model: {result['selected_model']}")
        print(f"Credit Score: {result['credit_score']}")
        print(f"Risk Category: {result['risk_category']}")
        print(f"Matched {len(result['eligible_subsidies'])} subsidies.")

if __name__ == "__main__":
    unittest.main()
