const axios = require('axios');
const config = require('../config/config');
const logger = require('../utils/logger');

/**
 * Forward the assembled payload to the ML microservice
 */
const callMLService = async (payload) => {
  if (!config.ngrokUrl) {
    throw new Error('NGROK_URL is not configured');
  }

  const mlEndpoint = `${config.ngrokUrl}/predict`;
  const startTime = Date.now();

  try {
    logger.info('Sending request to ML microservice', { endpoint: mlEndpoint, enterprise_id: payload.enterprise_id });

    const response = await axios.post(mlEndpoint, payload, {
      timeout: 30000, // 30 seconds
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const latency = Date.now() - startTime;
    logger.info('ML microservice response received', {
      enterprise_id: payload.enterprise_id,
      credit_score: response.data.credit_score,
      risk_category: response.data.risk_category,
      latency_ms: latency,
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    const latency = Date.now() - startTime;

    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      logger.error('ML service timeout', { latency_ms: latency, error: error.message });
      return {
        success: false,
        statusCode: 503,
        error: 'ML service unavailable',
        detail: 'Request to ML microservice timed out after 30 seconds',
      };
    }

    if (error.response) {
      // ML service returned an error response
      logger.error('ML service returned error', {
        status: error.response.status,
        data: error.response.data,
        latency_ms: latency,
      });

      if (error.response.status >= 400 && error.response.status < 500) {
        // 4xx errors - forward unchanged
        return {
          success: false,
          statusCode: error.response.status,
          data: error.response.data,
        };
      } else {
        // 5xx errors
        return {
          success: false,
          statusCode: 502,
          error: 'ML service error',
          detail: error.response.data?.message || 'ML microservice returned a server error',
        };
      }
    }

    // Network error or ML service unreachable
    logger.error('ML service unreachable', { error: error.message, latency_ms: latency });
    return {
      success: false,
      statusCode: 503,
      error: 'ML service unavailable',
      detail: `Unable to reach ML microservice: ${error.message}`,
    };
  }
};

module.exports = {
  callMLService,
};
