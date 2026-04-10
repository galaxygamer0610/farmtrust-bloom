const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

/**
 * Auto-compute derived fields
 */
const computeDerivedFields = (data) => {
  const netProfit = data.net_profit !== undefined && data.net_profit !== null
    ? data.net_profit
    : data.annual_revenue - data.annual_expenses;

  const debtToEquity = data.debt_to_equity !== undefined && data.debt_to_equity !== null
    ? data.debt_to_equity
    : data.loan_amount / (data.annual_revenue * 2 + 1e-6);

  logger.debug('Derived fields computed', { net_profit: netProfit, debt_to_equity: debtToEquity });

  return {
    net_profit: netProfit,
    debt_to_equity: debtToEquity,
  };
};

/**
 * Assemble the complete 18-field payload for ML microservice
 */
const assemblePayload = (farmerData, externalData, derivedFields) => {
  const enterpriseId = farmerData.enterprise_id || uuidv4();

  const payload = {
    enterprise_id: enterpriseId,
    enterprise_size: farmerData.enterprise_size,
    region: farmerData.region,
    quarter: farmerData.quarter,
    annual_revenue: farmerData.annual_revenue,
    annual_expenses: farmerData.annual_expenses,
    loan_amount: farmerData.loan_amount,
    net_profit: derivedFields.net_profit,
    debt_to_equity: derivedFields.debt_to_equity,
    avg_temperature: externalData.avg_temperature,
    rainfall: externalData.rainfall,
    drought_index: externalData.drought_index,
    flood_risk: externalData.flood_risk,
    commodity_price_index: externalData.commodity_price_index,
    input_cost_index: externalData.input_cost_index,
    policy_support_score: externalData.policy_support_score,
    landholding_size: farmerData.landholding_size,
    crop_type: farmerData.crop_type,
    irrigation_type: farmerData.irrigation_type,
  };

  logger.debug('Payload assembled', { payload });

  return payload;
};

module.exports = {
  computeDerivedFields,
  assemblePayload,
};
