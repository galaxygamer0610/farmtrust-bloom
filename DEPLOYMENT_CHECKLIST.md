# Deployment Checklist

## Pre-Deployment

### 1. ML Microservice Setup
- [ ] ML microservice is running
- [ ] ML microservice has `/predict` endpoint
- [ ] ML microservice accepts 18-field JSON payload
- [ ] ML microservice returns expected response format
- [ ] Test ML service locally: `curl http://localhost:<PORT>/predict -d @test-request.json`

### 2. Ngrok Setup
- [ ] Ngrok is installed
- [ ] Start ngrok tunnel: `ngrok http <ML_SERVICE_PORT>`
- [ ] Copy ngrok URL (e.g., `https://abc123.ngrok-free.app`)
- [ ] Test ngrok URL: `curl <NGROK_URL>/predict`

### 3. Backend Configuration
- [ ] Update `NGROK_URL` in `.env`
- [ ] Set `APP_ENV=production` (if using real APIs)
- [ ] Set `LOG_LEVEL=INFO` (or DEBUG for troubleshooting)
- [ ] Configure production API URLs (if available)
- [ ] Review all environment variables

### 4. Testing
- [ ] Run health check: `curl http://localhost:8000/api/v1/health`
- [ ] Test enum endpoint: `curl http://localhost:8000/api/v1/config/enums`
- [ ] Test assess endpoint: `curl -X POST http://localhost:8000/api/v1/assess -d @test-request.json`
- [ ] Verify ML service receives correct payload
- [ ] Verify response is returned correctly
- [ ] Test error scenarios (invalid input, ML service down)

## Deployment Options

### Option 1: Local Development
```bash
# Terminal 1: Start ML service
python ml_service.py

# Terminal 2: Expose ML service via ngrok
ngrok http 5000

# Terminal 3: Start backend
npm run dev
```

### Option 2: Expose Backend via Ngrok
```bash
# Terminal 1: Start backend
npm run dev

# Terminal 2: Expose backend via ngrok
ngrok http 8000

# Use ngrok URL in frontend
```

### Option 3: Cloud Deployment (Heroku)
```bash
# Install Heroku CLI
heroku login
heroku create farmtrust-backend

# Set environment variables
heroku config:set NGROK_URL=https://your-ml-service.ngrok-free.app
heroku config:set APP_ENV=production
heroku config:set PORT=8000

# Deploy
git push heroku main

# Check logs
heroku logs --tail
```

### Option 4: Cloud Deployment (Railway)
1. Connect GitHub repository
2. Set environment variables in Railway dashboard
3. Deploy automatically on push

### Option 5: Cloud Deployment (Render)
1. Connect GitHub repository
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Set environment variables
5. Deploy

## Post-Deployment

### 1. Verification
- [ ] Health check returns 200: `curl <BACKEND_URL>/api/v1/health`
- [ ] Enum endpoint works: `curl <BACKEND_URL>/api/v1/config/enums`
- [ ] Assess endpoint works: `curl -X POST <BACKEND_URL>/api/v1/assess -d @test-request.json`
- [ ] Response time is acceptable (<5s)
- [ ] Logs are being generated
- [ ] No errors in logs

### 2. Frontend Integration
- [ ] Update frontend API endpoint to backend URL
- [ ] Test form submission from frontend
- [ ] Verify results are displayed correctly
- [ ] Test error handling in frontend
- [ ] Test loading states

### 3. Monitoring Setup
- [ ] Set up log aggregation (e.g., Papertrail, Loggly)
- [ ] Set up uptime monitoring (e.g., UptimeRobot)
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Set up performance monitoring (e.g., New Relic)
- [ ] Configure alerts for errors

### 4. Security
- [ ] CORS is configured for production (not `*`)
- [ ] HTTPS is enabled
- [ ] Rate limiting is configured (if needed)
- [ ] API authentication is enabled (if needed)
- [ ] Sensitive data is not logged
- [ ] Environment variables are secure

## Production Environment Variables

```env
# Required
NGROK_URL=https://your-ml-service.ngrok-free.app
APP_ENV=production
PORT=8000

# Optional
LOG_LEVEL=INFO
FRONTEND_URL=https://your-frontend.com

# External APIs (if using real APIs)
IMD_API_URL=https://api.imd.gov.in/v1
NDMA_API_URL=https://api.ndma.gov.in/v1
AGMARKNET_URL=https://api.agmarknet.gov.in/v1
AGRIMIN_URL=https://api.agricoop.gov.in/v1
```

## Troubleshooting

### Backend won't start
1. Check Node.js version: `node --version` (should be 14+)
2. Check dependencies: `npm install`
3. Check port availability: `netstat -ano | findstr :8000`
4. Check .env file exists and is valid
5. Check logs for errors

### ML service connection fails
1. Verify NGROK_URL is correct
2. Test ML service directly: `curl <NGROK_URL>/predict`
3. Check ngrok tunnel is active
4. Check ML service is running
5. Check firewall settings

### Validation errors
1. Check request body format
2. Verify all required fields are present
3. Check enum values are exact matches (case-sensitive)
4. Check numeric values are in valid ranges
5. Review validation.js for rules

### Slow response times
1. Check ML service performance
2. Check external API latency (if using real APIs)
3. Check network latency to ngrok
4. Consider caching external API responses
5. Check server resources (CPU, memory)

### CORS errors
1. Verify CORS is enabled in server.js
2. Check FRONTEND_URL is set correctly
3. Test with `curl -H "Origin: <FRONTEND_URL>"`
4. Check browser console for specific error

## Rollback Plan

If deployment fails:
1. Stop the backend: `Ctrl+C` or `heroku ps:scale web=0`
2. Revert to previous version: `git revert HEAD` or `heroku rollback`
3. Check logs for errors: `heroku logs --tail`
4. Fix issues locally
5. Test thoroughly
6. Redeploy

## Maintenance

### Regular Tasks
- [ ] Monitor logs daily
- [ ] Check error rates weekly
- [ ] Review performance metrics weekly
- [ ] Update dependencies monthly: `npm update`
- [ ] Security audit quarterly: `npm audit`
- [ ] Backup configuration files

### Scaling Considerations
- [ ] Monitor request volume
- [ ] Monitor response times
- [ ] Monitor error rates
- [ ] Consider horizontal scaling if needed
- [ ] Consider caching if needed
- [ ] Consider load balancing if needed

## Support Contacts

- Backend Developer: [Your Name]
- ML Service Owner: [ML Team]
- DevOps: [DevOps Team]
- Frontend Team: [Frontend Team]

## Documentation Links

- [README.md](./README.md) - Complete documentation
- [QUICKSTART.md](./QUICKSTART.md) - Quick start guide
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture details
- [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - Project overview

## Success Criteria

✅ Backend is accessible via URL
✅ Health check returns 200
✅ Assess endpoint returns valid responses
✅ Response time < 5 seconds
✅ Error rate < 1%
✅ Frontend can submit assessments
✅ Results are displayed correctly
✅ Logs are being generated
✅ Monitoring is active

## Sign-off

- [ ] Backend deployed successfully
- [ ] All tests passing
- [ ] Frontend integrated
- [ ] Monitoring configured
- [ ] Documentation updated
- [ ] Team notified

Deployed by: _______________
Date: _______________
Version: _______________
