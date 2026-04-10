const axios = require('axios');
const config = require('../config/config');
const logger = require('../utils/logger');
const {
  IMD_MOCK,
  NDMA_MOCK,
  AGMARKNET_MOCK,
  INPUT_COST_MOCK,
  POLICY_MOCK,
} = require('./mockData');

// Default fallback values
const DEFAULTS = {
  avg_temperature: 25.0,
  rainfall: 200.0,
  drought_index: 0.5,
  flood_risk: 0.5,
  commodity_price_index: 100.0,
  input_cost_index: 100.0,
  policy_support_score: 2,
};

/**
 * Fetch IMD (India Meteorological Department) data
 */
const fetchIMD = async (region) => {
  // Use mock data in development
  if (config.appEnv === 'development') {
    const data = IMD_MOCK[region] || { avg_temperature: DEFAULTS.avg_temperature, rainfall: DEFAULTS.rainfall };
    logger.debug('IMD data fetched (mock)', { region, data, used_mock: true });
    return data;
  }

  try {
    const url = `${config.imdApiUrl}/climate?region=${region}`;
    const response = await axios.get(url, { timeout: 5000 });
    logger.info('IMD data fetched (production)', { region, data: response.data, used_mock: false });
    return {
      avg_temperature: response.data.avg_temperature || DEFAULTS.avg_temperature,
      rainfall: response.data.rainfall || DEFAULTS.rainfall,
    };
  } catch (error) {
    logger.warn('IMD API call failed, using fallback', { region, error: error.message });
    return { avg_temperature: DEFAULTS.avg_temperature, rainfall: DEFAULTS.rainfall };
  }
};

/**
 * Fetch NDMA (National Disaster Management Authority) data
 */
const fetchNDMA = async (region) => {
  if (config.appEnv === 'development') {
    const data = NDMA_MOCK[region] || { drought_index: DEFAULTS.drought_index, flood_risk: DEFAULTS.flood_risk };
    logger.debug('NDMA data fetched (mock)', { region, data, used_mock: true });
    return data;
  }

  try {
    const url = `${config.ndmaApiUrl}/risk?region=${region}`;
    const response = await axios.get(url, { timeout: 5000 });
    logger.info('NDMA data fetched (production)', { region, data: response.data, used_mock: false });
    return {
      drought_index: response.data.drought_index || DEFAULTS.drought_index,
      flood_risk: response.data.flood_risk || DEFAULTS.flood_risk,
    };
  } catch (error) {
    logger.warn('NDMA API call failed, using fallback', { region, error: error.message });
    return { drought_index: DEFAULTS.drought_index, flood_risk: DEFAULTS.flood_risk };
  }
};

/**
 * Fetch AGMARKNET data
 */
const fetchAgmarknet = async (region, cropType) => {
  if (config.appEnv === 'development') {
    const data = AGMARKNET_MOCK[cropType] || { commodity_price_index: DEFAULTS.commodity_price_index };
    logger.debug('AGMARKNET data fetched (mock)', { region, cropType, data, used_mock: true });
    return data;
  }

  try {
    const url = `${config.agmarknetUrl}/price?region=${region}&crop=${cropType}`;
    const response = await axios.get(url, { timeout: 5000 });
    logger.info('AGMARKNET data fetched (production)', { region, cropType, data: response.data, used_mock: false });
    return {
      commodity_price_index: response.data.commodity_price_index || DEFAULTS.commodity_price_index,
    };
  } catch (error) {
    logger.warn('AGMARKNET API call failed, using fallback', { region, cropType, error: error.message });
    return { commodity_price_index: DEFAULTS.commodity_price_index };
  }
};

/**
 * Fetch Agriculture Ministry data
 */
const fetchAgriMinistry = async (region) => {
  if (config.appEnv === 'development') {
    const data = INPUT_COST_MOCK[region] || { input_cost_index: DEFAULTS.input_cost_index };
    logger.debug('Agri Ministry data fetched (mock)', { region, data, used_mock: true });
    return data;
  }

  try {
    const url = `${config.agriMinUrl}/inputcost?region=${region}`;
    const response = await axios.get(url, { timeout: 5000 });
    logger.info('Agri Ministry data fetched (production)', { region, data: response.data, used_mock: false });
    return {
      input_cost_index: response.data.input_cost_index || DEFAULTS.input_cost_index,
    };
  } catch (error) {
    logger.warn('Agri Ministry API call failed, using fallback', { region, error: error.message });
    return { input_cost_index: DEFAULTS.input_cost_index };
  }
};

/**
 * Fetch Government Policy data
 */
const fetchPolicy = async (region) => {
  if (config.appEnv === 'development') {
    const data = POLICY_MOCK[region] || { policy_support_score: DEFAULTS.policy_support_score };
    logger.debug('Policy data fetched (mock)', { region, data, used_mock: true });
    return data;
  }

  try {
    const url = `${config.agriMinUrl}/policy?region=${region}`;
    const response = await axios.get(url, { timeout: 5000 });
    logger.info('Policy data fetched (production)', { region, data: response.data, used_mock: false });
    return {
      policy_support_score: response.data.policy_support_score || DEFAULTS.policy_support_score,
    };
  } catch (error) {
    logger.warn('Policy API call failed, using fallback', { region, error: error.message });
    return { policy_support_score: DEFAULTS.policy_support_score };
  }
};

/**
 * Fetch all external API data concurrently
 */
const fetchAllExternalData = async (region, cropType) => {
  const startTime = Date.now();
  
  try {
    const [imdData, ndmaData, agmarkData, agriData, policyData] = await Promise.all([
      fetchIMD(region),
      fetchNDMA(region),
      fetchAgmarknet(region, cropType),
      fetchAgriMinistry(region),
      fetchPolicy(region),
    ]);

    const latency = Date.now() - startTime;
    logger.info('All external API calls completed', { latency_ms: latency });

    return {
      ...imdData,
      ...ndmaData,
      ...agmarkData,
      ...agriData,
      ...policyData,
    };
  } catch (error) {
    logger.error('Error in fetchAllExternalData', { error: error.message });
    throw error;
  }
};

module.exports = {
  fetchAllExternalData,
};
