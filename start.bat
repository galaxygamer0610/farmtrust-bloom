@echo off
REM FarmTrust ML Microservice Startup Script for Windows

echo ==========================================
echo FarmTrust ML Microservice
echo ==========================================

REM Check if virtual environment exists
if not exist "venv\" (
    echo Virtual environment not found!
    echo Creating virtual environment...
    python -m venv venv
    echo Virtual environment created
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Check if dependencies are installed
if not exist "venv\Scripts\uvicorn.exe" (
    echo Installing dependencies...
    pip install -r requirements.txt
    echo Dependencies installed
)

REM Check if model file exists
if not exist "..\ml\pbl\xgboost_model.pkl" (
    echo WARNING: Model file not found at ..\ml\pbl\xgboost_model.pkl
    echo Please ensure the ML model is in the correct location
)

REM Start the service
echo.
echo Starting microservice on http://localhost:8000
echo API Documentation: http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop
echo ==========================================

python app.py
