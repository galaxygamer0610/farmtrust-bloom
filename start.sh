#!/bin/bash

# FarmTrust ML Microservice Startup Script

echo "=========================================="
echo "FarmTrust ML Microservice"
echo "=========================================="

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found!"
    echo "Creating virtual environment..."
    python -m venv venv
    echo "✅ Virtual environment created"
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Check if dependencies are installed
if [ ! -f "venv/bin/uvicorn" ]; then
    echo "Installing dependencies..."
    pip install -r requirements.txt
    echo "✅ Dependencies installed"
fi

# Check if model file exists
if [ ! -f "../ml/pbl/xgboost_model.pkl" ]; then
    echo "⚠️  WARNING: Model file not found at ../ml/pbl/xgboost_model.pkl"
    echo "Please ensure the ML model is in the correct location"
fi

# Start the service
echo ""
echo "Starting microservice on http://localhost:8000"
echo "API Documentation: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop"
echo "=========================================="

python app.py
