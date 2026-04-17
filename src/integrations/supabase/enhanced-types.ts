// Enhanced TypeScript types for KisanCred database schema
// Based on data_parameters.md specification

export interface FarmerFinancialData {
  id: string;
  farmer_id: string;
  
  // Identity & Contact
  aadhaar_number?: string;
  
  // Location & Timing
  state: string;
  district: string;
  region: 'North' | 'South' | 'East' | 'West';
  farming_season: 'Kharif' | 'Rabi' | 'Zaid';
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  
  // Core Financial Fields (in ₹ thousands)
  enterprise_size: 'Small' | 'Medium' | 'Large';
  annual_revenue: number;
  annual_expenses: number;
  loan_amount: number;
  
  // Agricultural Fields
  landholding_size: number;
  crop_type: 'Wheat' | 'Rice' | 'Cotton' | 'Maize' | 'Pulses' | 'Vegetables' | 'Groundnut';
  irrigation_type: 'Rainfed' | 'Canal' | 'Borewell' | 'Sprinkler' | 'Drip';
  land_ownership_status?: 'Owned' | 'Leased';
  
  // Auto-Calculated Derived Fields (read-only)
  net_profit?: number;
  debt_to_equity_ratio?: number;
  
  // Metadata
  created_at: string;
  updated_at: string;
}

export interface ApiFetchedData {
  id: string;
  farmer_id: string;
  financial_data_id?: string;
  
  // IMD API Data
  average_temperature?: number; // °C
  rainfall?: number; // mm
  
  // NDMA API Data
  drought_index?: number; // 0.0 to 1.0
  flood_risk?: number; // 0.0 to 1.0
  
  // AGMARKNET API Data
  commodity_price_index?: number;
  
  // Ministry of Agriculture API Data
  input_cost_index?: number;
  
  // Government Policy Database
  policy_support_score?: number; // 1 to 4
  
  // Metadata
  fetched_at: string;
  data_source_version?: string;
  is_valid: boolean;
  created_at: string;
  updated_at: string;
}

export interface MLAssessment {
  id: string;
  farmer_id: string;
  financial_data_id?: string;
  api_data_id?: string;
  
  // ML Model Output
  predicted_credit_score?: number; // 0 to 100
  risk_category?: 'Low' | 'Medium' | 'High' | 'Very High';
  
  // Component Scores
  financial_stability_score?: number;
  climate_resilience_score?: number;
  market_risk_score?: number;
  repayment_capacity_score?: number;
  
  // Advanced Engineered Features
  expense_to_revenue_ratio?: number;
  debt_sustainability_ratio?: number;
  net_profit_margin?: number;
  climate_resilience_index?: number;
  temperature_stress_indicator?: number;
  market_risk_indicator?: number;
  
  // SHAP Explainability
  shap_values?: Record<string, any>;
  top_positive_factors?: Array<{ factor: string; impact: number }>;
  top_negative_factors?: Array<{ factor: string; impact: number }>;
  
  // Model Metadata
  model_version?: string;
  model_confidence?: number; // 0.0 to 1.0
  assessment_date: string;
  
  // Recommendations
  improvement_suggestions?: Array<{ category: string; suggestion: string }>;
  eligible_subsidies?: string[];
  
  created_at: string;
  updated_at: string;
}

export interface FarmerCreditOverview {
  farmer_id: string;
  full_name: string;
  email: string;
  phone?: string;
  farm_location?: string;
  farm_size_acres?: number;
  state?: string;
  district?: string;
  region?: string;
  crop_type?: string;
  annual_revenue?: number;
  annual_expenses?: number;
  net_profit?: number;
  loan_amount?: number;
  debt_to_equity_ratio?: number;
  predicted_credit_score?: number;
  risk_category?: string;
  assessment_date?: string;
  top_positive_factors?: any;
  top_negative_factors?: any;
}

// Insert types
export type FarmerFinancialDataInsert = Omit<FarmerFinancialData, 'id' | 'net_profit' | 'debt_to_equity_ratio' | 'created_at' | 'updated_at'>;
export type ApiFetchedDataInsert = Omit<ApiFetchedData, 'id' | 'created_at' | 'updated_at'>;
export type MLAssessmentInsert = Omit<MLAssessment, 'id' | 'created_at' | 'updated_at'>;

// Update types
export type FarmerFinancialDataUpdate = Partial<FarmerFinancialDataInsert>;
export type ApiFetchedDataUpdate = Partial<ApiFetchedDataInsert>;
export type MLAssessmentUpdate = Partial<MLAssessmentInsert>;
