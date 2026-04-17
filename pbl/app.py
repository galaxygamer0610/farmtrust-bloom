from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Any, Dict
import asyncio

# Import the ML pipeline executor
from inference import full_assessment

app = FastAPI(
    title="Farmer Credit System ML Orchestrator",
    description="FastAPI endpoint for running the credit scoring and subsidy matching ML pipeline.",
    version="1.0.0"
)

class AssessmentRequest(BaseModel):
    enterprise_id: Optional[str] = None
    enterprise_size: Optional[str] = "Small"
    state: Optional[str] = "Maharashtra"
    city: Optional[str] = "Pune"
    quarter: Optional[str] = "Q1"
    annual_revenue: float = 100.0
    annual_expenses: float = 50.0
    loan_amount: float = 0.0
    landholding_size: Optional[float] = 1.0
    crop_type: Optional[str] = "Wheat"
    irrigation_type: Optional[str] = "Canal"
    yield_amount: float = 5.0 # Yield index or amount provided by farmer

    class Config:
        extra = "allow" # Allow additional fields to be passed dynamically

class Orchestrator:
    @staticmethod
    async def run_pipeline(payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Orchestrates the execution of the full ML pipeline 
        including data fetching, predictions, and subsidy matching.
        """
        try:
            # Execute the full async assessment from inference.py
            result = await full_assessment(payload)
            return result
        except Exception as e:
            raise Exception(f"Pipeline execution failed: {str(e)}")

@app.post("/api/v1/assess", summary="Run full ML credit & subsidy assessment")
async def assess_enterprise(request: AssessmentRequest):
    """
    Endpoint to trigger the ML Assessment Pipeline.
    Takes farmer/enterprise data, runs models, and returns credit and subsidy data.
    """
    try:
        # Convert request model to dictionary, including any extra fields
        payload = request.dict(exclude_unset=True)
        
        # Run the orchestrator pipeline
        result = await Orchestrator.run_pipeline(payload)
        
        return {
            "status": "success",
            "data": result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    # Run the server with: uvicorn app:app --reload
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
