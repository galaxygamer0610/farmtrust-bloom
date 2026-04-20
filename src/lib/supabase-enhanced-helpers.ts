// Enhanced Supabase helper functions for KisanCred
// Handles farmer financial data, API data, and ML assessments

import { supabase } from "@/integrations/supabase/client";
import type {
  FarmerFinancialData,
  FarmerFinancialDataInsert,
  FarmerFinancialDataUpdate,
  ApiFetchedData,
  ApiFetchedDataInsert,
  MLAssessment,
  MLAssessmentInsert,
  FarmerCreditOverview,
} from "@/integrations/supabase/enhanced-types";

export const enhancedSupabaseHelpers = {
  // ============================================================================
  // FARMER FINANCIAL DATA
  // ============================================================================
  financialData: {
    /**
     * Create farmer financial data from onboarding form
     */
    async create(data: FarmerFinancialDataInsert) {
      const { data: result, error } = await supabase
        .from("farmer_financial_data")
        .insert(data)
        .select()
        .single();

      return { data: result as FarmerFinancialData | null, error };
    },

    /**
     * Get latest financial data for a farmer
     */
    async getLatest(farmerId: string) {
      const { data, error } = await supabase
        .from("farmer_financial_data")
        .select("*")
        .eq("farmer_id", farmerId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      return { data: data as FarmerFinancialData | null, error };
    },

    /**
     * Get all financial data history for a farmer
     */
    async getHistory(farmerId: string) {
      const { data, error } = await supabase
        .from("farmer_financial_data")
        .select("*")
        .eq("farmer_id", farmerId)
        .order("created_at", { ascending: false });

      return { data: data as FarmerFinancialData[] | null, error };
    },

    /**
     * Update financial data
     */
    async update(id: string, updates: FarmerFinancialDataUpdate) {
      const { data, error } = await supabase
        .from("farmer_financial_data")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      return { data: data as FarmerFinancialData | null, error };
    },
  },

  // ============================================================================
  // API FETCHED DATA
  // ============================================================================
  apiData: {
    /**
     * Store API fetched data
     */
    async create(data: ApiFetchedDataInsert) {
      const { data: result, error } = await supabase
        .from("api_fetched_data")
        .insert(data)
        .select()
        .single();

      return { data: result as ApiFetchedData | null, error };
    },

    /**
     * Get latest API data for a farmer
     */
    async getLatest(farmerId: string) {
      const { data, error } = await supabase
        .from("api_fetched_data")
        .select("*")
        .eq("farmer_id", farmerId)
        .order("fetched_at", { ascending: false })
        .limit(1)
        .single();

      return { data: data as ApiFetchedData | null, error };
    },

    /**
     * Get API data by financial data ID
     */
    async getByFinancialDataId(financialDataId: string) {
      const { data, error } = await supabase
        .from("api_fetched_data")
        .select("*")
        .eq("financial_data_id", financialDataId)
        .order("fetched_at", { ascending: false })
        .limit(1)
        .single();

      return { data: data as ApiFetchedData | null, error };
    },
  },

  // ============================================================================
  // ML ASSESSMENTS
  // ============================================================================
  mlAssessments: {
    /**
     * Create ML assessment from backend ML service response
     */
    async create(data: MLAssessmentInsert) {
      const { data: result, error } = await supabase
        .from("ml_assessments")
        .insert(data)
        .select()
        .single();

      return { data: result as MLAssessment | null, error };
    },

    /**
     * Get latest ML assessment for a farmer
     */
    async getLatest(farmerId: string) {
      const { data, error } = await supabase
        .from("ml_assessments")
        .select("*")
        .eq("farmer_id", farmerId)
        .order("assessment_date", { ascending: false })
        .limit(1)
        .single();

      return { data: data as MLAssessment | null, error };
    },

    /**
     * Get ML assessment history for a farmer
     */
    async getHistory(farmerId: string) {
      const { data, error } = await supabase
        .from("ml_assessments")
        .select("*")
        .eq("farmer_id", farmerId)
        .order("assessment_date", { ascending: false });

      return { data: data as MLAssessment[] | null, error };
    },

    /**
     * Get ML assessment by ID
     */
    async getById(assessmentId: string) {
      const { data, error } = await supabase
        .from("ml_assessments")
        .select("*")
        .eq("id", assessmentId)
        .single();

      return { data: data as MLAssessment | null, error };
    },
  },

  // ============================================================================
  // COMBINED QUERIES
  // ============================================================================
  combined: {
    /**
     * Get complete farmer profile with all related data
     */
    async getCompleteProfile(farmerId: string) {
      const { data, error } = await supabase.rpc("get_farmer_complete_profile", {
        p_farmer_id: farmerId,
      });

      return { data, error };
    },

    /**
     * Get farmer credit overview (uses view)
     */
    async getCreditOverview(farmerId: string) {
      const { data, error } = await supabase
        .from("farmer_credit_overview")
        .select("*")
        .eq("farmer_id", farmerId)
        .single();

      return { data: data as FarmerCreditOverview | null, error };
    },

    /**
     * Get all farmers with their latest credit scores
     */
    async getAllFarmersCreditOverview() {
      const { data, error } = await supabase
        .from("farmer_credit_overview")
        .select("*")
        .order("predicted_credit_score", { ascending: false });

      return { data: data as FarmerCreditOverview[] | null, error };
    },
  },

  // ============================================================================
  // WORKFLOW HELPERS
  // ============================================================================
  workflow: {
    /**
     * Complete onboarding workflow:
     * 1. Create farmer profile
     * 2. Store financial data
     * 3. Return IDs for backend ML service call
     */
    async completeOnboarding(params: {
      userId: string;
      email: string;
      farmerName: string;
      phoneNumber: string;
      aadhaarNumber?: string;
      farmerId?: string;
      state: string;
      district: string;
      region: string;
      farmingSeason: string;
      quarter: string;
      enterpriseSize: string;
      annualRevenue: number;
      annualExpenses: number;
      loanAmount: number;
      landholdingSize: number;
      cropType: string;
      irrigationType: string;
      landOwnershipStatus?: string;
    }) {
      try {
        // 1. Create or get farmer profile
        const { data: existingFarmer } = await supabase
          .from("farmers")
          .select("*")
          .eq("user_id", params.userId)
          .single();

        let farmerId: string;

        if (existingFarmer) {
          farmerId = existingFarmer.id;
        } else {
          const insertData: any = {
            user_id: params.userId,
            full_name: params.farmerName,
            email: params.email,
            phone: params.phoneNumber,
            government_id: params.aadhaarNumber,
            farm_location: `${params.district}, ${params.state}`,
            farm_size_acres: params.landholdingSize,
            crop_types: [params.cropType],
          };
          
          // Only add farmer_id if provided (for backward compatibility)
          if (params.farmerId) {
            insertData.farmer_id = params.farmerId;
          }
          
          const { data: newFarmer, error: farmerError } = await supabase
            .from("farmers")
            .insert(insertData)
            .select()
            .single();

          if (farmerError || !newFarmer) {
            return { data: null, error: farmerError };
          }

          farmerId = newFarmer.id;
        }

        // 2. Store financial data
        const { data: financialData, error: financialError } =
          await enhancedSupabaseHelpers.financialData.create({
            farmer_id: farmerId,
            aadhaar_number: params.aadhaarNumber,
            state: params.state,
            district: params.district,
            region: params.region as any,
            farming_season: params.farmingSeason as any,
            quarter: params.quarter as any,
            enterprise_size: params.enterpriseSize as any,
            annual_revenue: params.annualRevenue,
            annual_expenses: params.annualExpenses,
            loan_amount: params.loanAmount,
            landholding_size: params.landholdingSize,
            crop_type: params.cropType as any,
            irrigation_type: params.irrigationType as any,
            land_ownership_status: params.landOwnershipStatus as any,
          });

        if (financialError || !financialData) {
          return { data: null, error: financialError };
        }

        // 3. Return IDs for backend processing
        return {
          data: {
            farmerId,
            financialDataId: financialData.id,
            message: "Onboarding data saved successfully",
          },
          error: null,
        };
      } catch (error) {
        return { data: null, error };
      }
    },

    /**
     * Store ML service response
     */
    async storeMLResponse(params: {
      farmerId: string;
      financialDataId: string;
      apiDataId?: string;
      mlResponse: {
        creditScore: number;
        riskCategory: string;
        componentScores?: any;
        shapValues?: any;
        topPositiveFactors?: any;
        topNegativeFactors?: any;
        improvementSuggestions?: any;
        eligibleSubsidies?: string[];
        modelVersion?: string;
        modelConfidence?: number;
      };
    }) {
      const { data, error } = await enhancedSupabaseHelpers.mlAssessments.create({
        farmer_id: params.farmerId,
        financial_data_id: params.financialDataId,
        api_data_id: params.apiDataId,
        predicted_credit_score: params.mlResponse.creditScore,
        risk_category: params.mlResponse.riskCategory as any,
        shap_values: params.mlResponse.shapValues,
        top_positive_factors: params.mlResponse.topPositiveFactors,
        top_negative_factors: params.mlResponse.topNegativeFactors,
        improvement_suggestions: params.mlResponse.improvementSuggestions,
        eligible_subsidies: params.mlResponse.eligibleSubsidies,
        model_version: params.mlResponse.modelVersion,
        model_confidence: params.mlResponse.modelConfidence,
        assessment_date: new Date().toISOString(),
      });

      return { data, error };
    },
  },
};
