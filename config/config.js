require('dotenv').config();

const config = {
  ngrokUrl: process.env.NGROK_URL,
  appEnv: process.env.APP_ENV || 'development',
  port: parseInt(process.env.PORT) || 8000,
  logLevel: process.env.LOG_LEVEL || 'INFO',
  
  // External API URLs
  imdApiUrl: process.env.IMD_API_URL || 'https://api.imd.gov.in/v1',
  ndmaApiUrl: process.env.NDMA_API_URL || 'https://api.ndma.gov.in/v1',
  agmarknetUrl: process.env.AGMARKNET_URL || 'https://api.agmarknet.gov.in/v1',
  agriMinUrl: process.env.AGRIMIN_URL || 'https://api.agricoop.gov.in/v1',
};

// Validation
if (!config.ngrokUrl) {
  console.warn('WARNING: NGROK_URL not set in environment variables');
}

module.exports = config;
