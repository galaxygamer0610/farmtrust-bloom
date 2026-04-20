# Quick Start Guide

Get the microservice running in 5 minutes!

## Step 1: Install Dependencies

### Windows:
```bash
cd microservice
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### Linux/Mac:
```bash
cd microservice
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Step 2: Start the Service

### Windows:
```bash
start.bat
```

### Linux/Mac:
```bash
chmod +x start.sh
./start.sh
```

Or manually:
```bash
python app.py
```

## Step 3: Test It

Open another terminal and run:
```bash
python test_api.py
```

Or visit in browser:
- **API Docs:** http://localhost:8000/docs
- **Health Check:** http://localhost:8000/health

## Step 4: Connect Backend

Update `backend/.env`:
```
NGROK_URL=http://localhost:8000
```

Restart backend:
```bash
cd backend
node server.js
```

## Done! 🎉

Your microservice is now running and connected to the backend.

## Troubleshooting

### "Module not found" error:
```bash
pip install -r requirements.txt
```

### "Model file not found":
- Check that `ml/pbl/xgboost_model.pkl` exists
- Verify you're in the correct directory

### Port 8000 already in use:
- Change PORT in `.env` file
- Or kill the process using port 8000

### Backend can't connect:
- Ensure microservice is running: `curl http://localhost:8000/health`
- Check NGROK_URL in backend/.env
- Verify no firewall blocking

## Next Steps

1. Test with Postman/curl
2. Check logs for any errors
3. Setup ngrok for external access
4. Deploy to production server
