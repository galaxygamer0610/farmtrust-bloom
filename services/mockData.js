// Mock data from Section 5 of the spec - derived from training dataset regional statistics

const IMD_MOCK = {
  North: { avg_temperature: 22.4, rainfall: 210.0 },
  South: { avg_temperature: 28.7, rainfall: 1850.0 },
  East: { avg_temperature: 27.1, rainfall: 1420.0 },
  West: { avg_temperature: 25.8, rainfall: 680.0 },
};

const NDMA_MOCK = {
  North: { drought_index: 0.38, flood_risk: 0.22 },
  South: { drought_index: 0.45, flood_risk: 0.55 },
  East: { drought_index: 0.30, flood_risk: 0.70 },
  West: { drought_index: 0.72, flood_risk: 0.18 },
};

const AGMARKNET_MOCK = {
  Wheat: { commodity_price_index: 124.0 },
  Rice: { commodity_price_index: 118.5 },
  Cotton: { commodity_price_index: 132.0 },
  Maize: { commodity_price_index: 108.0 },
  Pulses: { commodity_price_index: 141.0 },
  Vegetables: { commodity_price_index: 95.0 },
  Groundnut: { commodity_price_index: 127.0 },
};

const INPUT_COST_MOCK = {
  North: { input_cost_index: 98.0 },
  South: { input_cost_index: 104.0 },
  East: { input_cost_index: 92.0 },
  West: { input_cost_index: 101.0 },
};

const POLICY_MOCK = {
  North: { policy_support_score: 3 },
  South: { policy_support_score: 2 },
  East: { policy_support_score: 2 },
  West: { policy_support_score: 4 },
};

module.exports = {
  IMD_MOCK,
  NDMA_MOCK,
  AGMARKNET_MOCK,
  INPUT_COST_MOCK,
  POLICY_MOCK,
};
