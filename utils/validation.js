const ENUMS = {
  enterpriseSize: ['Small', 'Medium', 'Large'],
  region: ['North', 'South', 'East', 'West'],
  quarter: ['Q1', 'Q2', 'Q3', 'Q4'],
  cropType: ['Wheat', 'Rice', 'Cotton', 'Maize', 'Pulses', 'Vegetables', 'Groundnut'],
  irrigationType: ['Rainfed', 'Canal', 'Borewell', 'Sprinkler', 'Drip'],
};

const validateRequest = (data) => {
  const errors = [];

  // Required fields
  if (!data.enterprise_size) errors.push('enterprise_size is required');
  if (!data.region) errors.push('region is required');
  if (!data.quarter) errors.push('quarter is required');
  if (data.annual_revenue === undefined || data.annual_revenue === null) errors.push('annual_revenue is required');
  if (data.annual_expenses === undefined || data.annual_expenses === null) errors.push('annual_expenses is required');
  if (data.loan_amount === undefined || data.loan_amount === null) errors.push('loan_amount is required');
  if (data.landholding_size === undefined || data.landholding_size === null) errors.push('landholding_size is required');
  if (!data.crop_type) errors.push('crop_type is required');
  if (!data.irrigation_type) errors.push('irrigation_type is required');

  // Enum validations
  if (data.enterprise_size && !ENUMS.enterpriseSize.includes(data.enterprise_size)) {
    errors.push(`enterprise_size must be one of: ${ENUMS.enterpriseSize.join(', ')}`);
  }
  if (data.region && !ENUMS.region.includes(data.region)) {
    errors.push(`region must be one of: ${ENUMS.region.join(', ')}`);
  }
  if (data.quarter && !ENUMS.quarter.includes(data.quarter)) {
    errors.push(`quarter must be one of: ${ENUMS.quarter.join(', ')}`);
  }
  if (data.crop_type && !ENUMS.cropType.includes(data.crop_type)) {
    errors.push(`crop_type must be one of: ${ENUMS.cropType.join(', ')}`);
  }
  if (data.irrigation_type && !ENUMS.irrigationType.includes(data.irrigation_type)) {
    errors.push(`irrigation_type must be one of: ${ENUMS.irrigationType.join(', ')}`);
  }

  // Numeric validations
  if (data.annual_revenue !== undefined && data.annual_revenue <= 0) {
    errors.push('annual_revenue must be greater than 0');
  }
  if (data.annual_expenses !== undefined && data.annual_expenses < 0) {
    errors.push('annual_expenses must be greater than or equal to 0');
  }
  if (data.loan_amount !== undefined && data.loan_amount < 0) {
    errors.push('loan_amount must be greater than or equal to 0');
  }
  if (data.landholding_size !== undefined && data.landholding_size <= 0) {
    errors.push('landholding_size must be greater than 0');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  ENUMS,
  validateRequest,
};
