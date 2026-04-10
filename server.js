const express = require('express');
const cors = require('cors');
const config = require('./config/config');
const logger = require('./utils/logger');
const assessRoutes = require('./routes/assess');

const app = express();

// Middleware
app.use(cors({
  origin: config.appEnv === 'development' ? '*' : process.env.FRONTEND_URL,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip,
  });
  next();
});

// Routes
app.use('/api/v1', assessRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Farmer Credit & Subsidy Assessment Backend',
    version: '1.0.0',
    status: 'running',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
  });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  logger.info('Server started', {
    port: PORT,
    env: config.appEnv,
    ngrok_url: config.ngrokUrl,
  });
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${config.appEnv}`);
  console.log(`🔗 ML Service: ${config.ngrokUrl || 'NOT CONFIGURED'}\n`);
});

module.exports = app;
