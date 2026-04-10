/**
 * API Service for FarmTrust Bloom
 * Handles all communication with the Node.js backend
 */

// Backend API base URL - update this to match your backend server
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

/**
 * Backend Assessment Request Interface
 * Matches the backend's expected input format
 */
export interface BackendAssessmentRequest {
  enterprise_id?: string;
  enterprise_size: 'Small' | 'Medium' | 'Large';
  region: 'North' | 'South' | 'East' | 'West';
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  annual_revenue: number;
  annual_expenses: number;
  loan_amount: number;
  net_profit?: number;
  debt_to_equity?: number;
  landholding_size: number;
  crop_type: 'Wheat' | 'Rice' | 'Cotton' | 'Maize' | 'Pulses' | 'Vegetables' | 'Groundnut';
  irrigation_type: 'Rainfed' | 'Canal' | 'Borewell' | 'Sprinkler' | 'Drip';
}

/**
 * Backend Assessment Response Interface
 * Matches the ML microservice response format
 */
export interface BackendAssessmentResponse {
  enterprise_id: string;
  probability_of_default: number;
  credit_score: number;
  risk_category: string;
  lending_recommendation: string;
  top_features: Array<{
    label: string;
    value: number;
    importance: number;
  }>;
  eligible_subsidies: Array<{
    scheme_id: string;
    scheme_name: string;
    benefits: string;
    match_score: number;
  }>;
  model_version: string;
  assessed_at: string;
}

/**
 * Enum Configuration Response
 */
export interface EnumConfig {
  enterprise_size: string[];
  region: string[];
  quarter: string[];
  crop_type: string[];
  irrigation_type: string[];
}

/**
 * Health Check Response
 */
export interface HealthResponse {
  status: string;
  ngrok_url: string;
  env: string;
}

/**
 * API Error Response
 */
export interface ApiError {
  error: string;
  detail?: string;
  details?: string[];
}

/**
 * Fetch wrapper with error handling
 */
async function fetchWithErrorHandling<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      const error = data as ApiError;
      throw new Error(error.detail || error.error || `HTTP ${response.status}`);
    }

    return data as T;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
}

/**
 * Check backend health
 */
export async function checkHealth(): Promise<HealthResponse> {
  return fetchWithErrorHandling<HealthResponse>(`${API_BASE_URL}/health`);
}

/**
 * Get enum configuration for dropdowns
 */
export async function getEnumConfig(): Promise<EnumConfig> {
  return fetchWithErrorHandling<EnumConfig>(`${API_BASE_URL}/config/enums`);
}

/**
 * Submit farmer assessment request
 */
export async function submitAssessment(
  data: BackendAssessmentRequest
): Promise<BackendAssessmentResponse> {
  return fetchWithErrorHandling<BackendAssessmentResponse>(
    `${API_BASE_URL}/assess`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
}

/**
 * Map frontend form data to backend format
 */
export function mapFormDataToBackendRequest(
  formData: any
): BackendAssessmentRequest {
  // Map farm size to enterprise size
  const farmSize = parseFloat(formData.farmSize) || 0;
  let enterprise_size: 'Small' | 'Medium' | 'Large';
  if (farmSize <= 2) {
    enterprise_size = 'Small';
  } else if (farmSize <= 10) {
    enterprise_size = 'Medium';
  } else {
    enterprise_size = 'Large';
  }

  // Map region
  const regionMap: Record<string, 'North' | 'South' | 'East' | 'West'> = {
    arid: 'West',
    fertile: 'North',
    hilly: 'North',
    coastal: 'South',
    tropical: 'South',
  };
  const region = regionMap[formData.region] || 'North';

  // Map quarter
  const quarterMap: Record<string, 'Q1' | 'Q2' | 'Q3' | 'Q4'> = {
    kharif: 'Q2',
    rabi: 'Q4',
    zaid: 'Q1',
    yearround: 'Q3',
  };
  const quarter = quarterMap[formData.operationQuarter] || 'Q1';

  // Map crop type
  const cropMap: Record<string, 'Wheat' | 'Rice' | 'Cotton' | 'Maize' | 'Pulses' | 'Vegetables' | 'Groundnut'> = {
    wheat: 'Wheat',
    rice: 'Rice',
    cotton: 'Cotton',
    maize: 'Maize',
    pulses: 'Pulses',
    vegetables: 'Vegetables',
    groundnut: 'Groundnut',
  };
  const crop_type = cropMap[formData.mainCrop?.toLowerCase()] || 'Rice';

  // Map irrigation type (default to Rainfed if not specified)
  const irrigation_type: 'Rainfed' | 'Canal' | 'Borewell' | 'Sprinkler' | 'Drip' = 'Rainfed';

  return {
    enterprise_id: formData.name?.replace(/\s+/g, '-').toUpperCase() || undefined,
    enterprise_size,
    region,
    quarter,
    annual_revenue: parseFloat(formData.revenue) / 1000 || 0, // Convert to thousands
    annual_expenses: parseFloat(formData.expenses) / 1000 || 0, // Convert to thousands
    loan_amount: parseFloat(formData.loanAmount) / 1000 || 0, // Convert to thousands
    landholding_size: parseFloat(formData.farmSize) || 0,
    crop_type,
    irrigation_type,
  };
}

/**
 * Map backend response to dashboard data format
 */
export function mapBackendResponseToDashboard(
  response: BackendAssessmentResponse,
  formData: any
) {
  return {
    name: formData.name,
    village: formData.village,
    farmSize: formData.farmSize,
    mainCrop: formData.mainCrop,
    region: formData.region,
    
    // Use backend credit score
    overallScore: Math.round(response.credit_score),
    
    // Map top features to component scores (approximate)
    financialScore: Math.round(response.credit_score * 0.9), // Slightly lower
    agriculturalScore: Math.round(response.credit_score * 0.95),
    resilienceScore: Math.round(response.credit_score * 0.85),
    enablerScore: Math.round(response.credit_score * 0.8),
    
    loanAmount: formData.loanAmount,
    regionCurve: 1.0,
    
    // Backend-specific data
    probability_of_default: response.probability_of_default,
    risk_category: response.risk_category,
    lending_recommendation: response.lending_recommendation,
    top_features: response.top_features,
    eligible_subsidies: response.eligible_subsidies,
    model_version: response.model_version,
    assessed_at: response.assessed_at,
  };
}

export default {
  checkHealth,
  getEnumConfig,
  submitAssessment,
  mapFormDataToBackendRequest,
  mapBackendResponseToDashboard,
};
