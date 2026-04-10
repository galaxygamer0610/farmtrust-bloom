const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const { validateRequest, ENUMS } = require('../utils/validation');
const { fetchAllExternalData } = require('../services/apiFetcher');
const { computeDerivedFields, assemblePayload } = require('../services/assembler');
const { callMLService } = require('../services/mlClient');
const config = require('../config/config');

/**
 * POST /api/v1/assess
 * Main assessment endpoint
 */
router.post('/assess', async (req, res) => {
  const requestStartTime = Date.now();
  
  try {
    // Step 1: Validate incoming request
    const validation = validateRequest(req.body);
    if (!validation.isValid) {
      logger.warn('Validation failed', { errors: validation.errors });
      return res.status(422).json({
        error: 'Validation error',
        details: validation.errors,
      });
    }

    const farmerData = req.body;
    logger.info('Assessment request received', {
      enterprise_id: farmerData.enterprise_id,
      region: farmerData.region,
      crop_type: farmerData.crop_type,
    });

    // Step 2: Auto-compute derived fields
    const derivedFields = computeDerivedFields(farmerData);

    // Step 3: Fetch external API data (concurrent)
    const externalData = await fetchAllExternalData(farmerData.region, farmerData.crop_type);

    // Step 4: Assemble complete payload
    const mlPayload = assemblePayload(farmerData, externalData, derivedFields);

    // Step 5: Forward to ML microservice
    const mlResult = await callMLService(mlPayload);

    if (!mlResult.success) {
      return res.status(mlResult.statusCode).json({
        error: mlResult.error,
        detail: mlResult.detail,
      });
    }

    const totalLatency = Date.now() - requestStartTime;
    logger.info('Assessment completed successfully', {
      enterprise_id: mlPayload.enterprise_id,
      total_latency_ms: totalLatency,
    });

    // Forward ML response unchanged
    return res.status(200).json(mlResult.data);

  } catch (error) {
    logger.error('Unexpected error in assess endpoint', { error: error.message, stack: error.stack });
    return res.status(500).json({
      error: 'Internal server error',
      detail: error.message,
    });
  }
});

/**
 * GET /api/v1/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    ngrok_url: config.ngrokUrl,
    env: config.appEnv,
  });
});

/**
 * GET /api/v1/config/enums
 * Returns valid enum values for frontend
 */
router.get('/config/enums', (req, res) => {
  res.status(200).json({
    enterprise_size: ENUMS.enterpriseSize,
    region: ENUMS.region,
    quarter: ENUMS.quarter,
    crop_type: ENUMS.cropType,
    irrigation_type: ENUMS.irrigationType,
  });
});

module.exports = router;
