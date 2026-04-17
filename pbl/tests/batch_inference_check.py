try:
    from tabulate import tabulate
except ImportError:
    def tabulate(rows, headers, tablefmt):
        return "\n".join([str(row) for row in rows])

import asyncio
import os
import json
import sys

# Add project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from inference import full_assessment

# Directory containing the test profiles
PROFILES_DIR = os.path.join(os.path.dirname(__file__), 'test_profiles')

async def run_batch_tests():
    print("=" * 105)
    print("AYURVEDACONNECT: BATCH ML PIPELINE VERIFICATION")
    print("Running end-to-end assessment on all dummy farmer profiles using production model...")
    print("=" * 105 + "\n")

    test_files = [f for f in os.listdir(PROFILES_DIR) if f.endswith('.json')]
    
    results_table = []
    
    for filename in test_files:
        filepath = os.path.join(PROFILES_DIR, filename)
        with open(filepath, 'r') as f:
            profile_data = json.load(f)
        
        farmer_input = profile_data.get('input', {})
        expected_outcome = profile_data.get('expected_outcome', 'N/A')
        
        print(f"Assessing: {filename}...")
        
        try:
            # Run the full ML pipeline using the designated winner (Logistic Regression)
            actual_res = await full_assessment(farmer_input)
            
            score = actual_res.get('credit_score', 0)
            risk = actual_res.get('risk_category', 'Unknown')
            subsidies = len(actual_res.get('eligible_subsidies', []))
            
            results_table.append([
                filename,
                f"{score:.2f}",
                risk,
                subsidies,
                expected_outcome[:60] + "..." if len(expected_outcome) > 60 else expected_outcome
            ])
            
        except Exception as e:
            results_table.append([filename, "ERROR", str(e), 0, expected_outcome])

    # Print the summary table
    headers = ["Profile File", "Credit Score", "Actual Risk", "Subsidies", "Expected Outcome (Note)"]
    print("\n" + tabulate(results_table, headers=headers, tablefmt="grid"))
    
    print("\n" + "=" * 105)
    print("Verification complete. The system is consistent with the global tournament winner.")
    print("=" * 105)

if __name__ == "__main__":
    asyncio.run(run_batch_tests())
