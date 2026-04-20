"""
FarmTrust ML Microservice
FastAPI application for credit assessment and subsidy matching
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime
import sys
import os
import logging

# Configure logging FIRST
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Add ML folder to path
ml_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'ml', 'pbl'))
if ml_path not in sys.path:
    sys.path.insert(0, ml_path)

try:
    from inference import full_assessment
    logger.info(f"Successfully imported ML modules from {ml_path}")
except ImportError as e:
    logger.error(f"Failed to import ML modules: {e}")
    logger.error(f"ML path: {ml_path}")
    logger.error(f"sys.path: {sys.path}")
    raise

# Initialize FastAPI app
app = FastAPI(
    title="FarmTrust ML Microservice",
    description="Credit assessment and subsidy matching for farmers",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models for request/response validation
class FarmerInput(BaseModel):
    """Input model matching backend payload structure"""
    enterprise_id: Optional[str] = None
    enterprise_size: str = Field(..., description="Small, Medium, or Large")
    region: str = Field(..., description="North, South, East, or West")
    quarter: str = Field(..., description="Q1, Q2, Q3, or Q4")
    annual_revenue: float = Field(..., gt=0, description="Annual revenue in thousands")
    annual_expenses: float = Field(..., ge=0, description="Annual expenses in thousands")
    loan_amount: float = Field(..., ge=0, description="Loan amount in thousands")
    net_profit: float = Field(..., description="Net profit (auto-calculated by backend)")
    debt_to_equity: float = Field(..., ge=0, description="Debt to equity ratio")
    avg_temperature: float = Field(..., description="Average temperature in Celsius")
    rainfall: float = Field(..., ge=0, description="Rainfall in mm")
    drought_index: float = Field(..., ge=0, le=1, description="Drought index (0-1)")
    flood_risk: float = Field(..., ge=0, le=1, description="Flood risk score (0-1)")
    commodity_price_index: float = Field(..., gt=0, description="Commodity price index")
    input_cost_index: float = Field(..., gt=0, description="Input cost index")
    policy_support_score: int = Field(..., ge=1, le=4, description="Policy support score (1-4)")
    landholding_size: float = Field(..., gt=0, description="Land size in acres")
    crop_type: str = Field(..., description="Type of crop")
    irrigation_type: str = Field(..., description="Irrigation method")
    
    # Optional fields for better API compatibility
    state: Optional[str] = None
    city: Optional[str] = None
    yield_amount: Optional[float] = Field(default=5.0, description="Crop yield (1-10 scale)")

    class Config:
        schema_extra = {
            "example": {
                "enterprise_id": "FARM-12345-XYZ",
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
        }


class TopFeature(BaseModel):
    """Model for top feature importance"""
    label: str
    value: float
    importance: float


class EligibleSubsidy(BaseModel):
    """Model for eligible subsidy scheme"""
    scheme_id: str
    scheme_name: str
    benefits: str
    match_score: float


class PredictionResponse(BaseModel):
    """Response model matching API contract"""
    enterprise_id: str
    probability_of_default: float
    credit_score: float
    risk_category: str
    lending_recommendation: str
    top_features: List[TopFeature]
    eligible_subsidies: List[EligibleSubsidy]
    selected_model: Optional[str] = None
    model_version: str
    assessed_at: str


@app.get("/")
async def root():
    """Root endpoint - health check"""
    return {
        "service": "FarmTrust ML Microservice",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "predict": "/predict",
            "health": "/health",
            "docs": "/docs"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "service": "ml-microservice"
    }


@app.post("/predict", response_model=PredictionResponse)
async def predict(data: FarmerInput):
    """
    Main prediction endpoint
    Receives farmer data from backend and returns credit assessment
    """
    try:
        logger.info(f"Prediction request received for enterprise_id: {data.enterprise_id}")
        
        # Convert Pydantic model to dict for ML pipeline
        input_dict = data.dict()
        
        # Map region to state/city if not provided
        if not input_dict.get('state') or not input_dict.get('city'):
            region_mapping = {
                'North': {'state': 'Punjab', 'city': 'Ludhiana'},
                'South': {'state': 'Tamil Nadu', 'city': 'Chennai'},
                'East': {'state': 'West Bengal', 'city': 'Kolkata'},
                'West': {'state': 'Maharashtra', 'city': 'Pune'}
            }
            location = region_mapping.get(data.region, {'state': 'Maharashtra', 'city': 'Pune'})
            input_dict['state'] = location['state']
            input_dict['city'] = location['city']
        
        # Call ML inference pipeline
        result = await full_assessment(input_dict)
        
        logger.info(f"Prediction completed for {result['enterprise_id']}: "
                   f"Score={result['credit_score']}, Risk={result['risk_category']}")
        
        return result
        
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(status_code=422, detail=str(e))
    
    except FileNotFoundError as e:
        logger.error(f"Model file not found: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="ML model not found. Please ensure xgboost_model.pkl exists."
        )
    
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error during prediction: {str(e)}"
        )


@app.get("/model/info")
async def model_info():
    """Get information about the loaded model"""
    try:
        from credit_score import CreditModel
        model = CreditModel()
        model.load_model()
        
        return {
            "model_name": model.model_name,
            "model_version": "1.2-Dynamic-Matcher",
            "threshold": getattr(model, 'threshold', 0.5),
            "features_count": 38,
            "status": "loaded"
        }
    except Exception as e:
        logger.error(f"Error loading model info: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    logger.info(f"Starting FarmTrust ML Microservice on {host}:{port}")
    
    uvicorn.run(
        "app:app",
        host=host,
        port=port,
        reload=True,  # Enable auto-reload during development
        log_level="info"
    )
