/**
 * Database Service for FarmTrust Bloom
 * Handles all Supabase database operations
 */

import { supabase } from "@/integrations/supabase/client";

/**
 * Farmer Profile Interface
 */
export interface FarmerProfile {
  id?: string;
  user_id?: string;
  name: string;
  village: string;
  farm_size: number;
  main_crop: string;
  region: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Assessment Interface
 */
export interface Assessment {
  id?: string;
  user_id?: string;
  
  // Input data
  enterprise_size: string;
  region: string;
  quarter: string;
  annual_revenue: number;
  annual_expenses: number;
  loan_amount: number;
  landholding_size: number;
  crop_type: string;
  irrigation_type: string;
  
  // Results from ML service
  credit_score: number;
  probability_of_default?: number;
  risk_category?: string;
  lending_recommendation?: string;
  
  // Additional scores (for display)
  financial_score?: number;
  agricultural_score?: number;
  resilience_score?: number;
  enabler_score?: number;
  
  // Metadata
  model_version?: string;
  assessed_at?: string;
  created_at?: string;
}

/**
 * Subsidy Match Interface
 */
export interface SubsidyMatch {
  id?: string;
  assessment_id: string;
  scheme_id: string;
  scheme_name: string;
  benefits: string;
  match_score: number;
  created_at?: string;
}

/**
 * Save or update farmer profile
 */
export async function saveFarmerProfile(profile: FarmerProfile): Promise<FarmerProfile> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const profileData = {
    ...profile,
    user_id: user.id,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('farmer_profiles')
    .upsert(profileData, { onConflict: 'user_id' })
    .select()
    .single();
  
  if (error) {
    console.error('Error saving farmer profile:', error);
    throw error;
  }
  
  return data;
}

/**
 * Get farmer profile for current user
 */
export async function getFarmerProfile(): Promise<FarmerProfile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from('farmer_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      // No profile found
      return null;
    }
    console.error('Error fetching farmer profile:', error);
    throw error;
  }
  
  return data;
}

/**
 * Save assessment to database
 */
export async function saveAssessment(assessment: Assessment): Promise<Assessment> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const assessmentData = {
    ...assessment,
    user_id: user.id,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('assessments')
    .insert(assessmentData)
    .select()
    .single();
  
  if (error) {
    console.error('Error saving assessment:', error);
    throw error;
  }
  
  return data;
}

/**
 * Get latest assessment for current user
 */
export async function getLatestAssessment(): Promise<Assessment | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from('assessments')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      // No assessments found
      return null;
    }
    console.error('Error fetching latest assessment:', error);
    throw error;
  }
  
  return data;
}

/**
 * Get assessment history for current user
 */
export async function getAssessmentHistory(limit: number = 10): Promise<Assessment[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('assessments')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching assessment history:', error);
    throw error;
  }
  
  return data || [];
}

/**
 * Get specific assessment by ID
 */
export async function getAssessmentById(id: string): Promise<Assessment | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from('assessments')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();
  
  if (error) {
    console.error('Error fetching assessment:', error);
    throw error;
  }
  
  return data;
}

/**
 * Save subsidy matches for an assessment
 */
export async function saveSubsidyMatches(
  assessmentId: string,
  subsidies: Omit<SubsidyMatch, 'id' | 'assessment_id' | 'created_at'>[]
): Promise<SubsidyMatch[]> {
  const subsidyData = subsidies.map(subsidy => ({
    ...subsidy,
    assessment_id: assessmentId,
    created_at: new Date().toISOString(),
  }));

  const { data, error } = await supabase
    .from('subsidy_matches')
    .insert(subsidyData)
    .select();
  
  if (error) {
    console.error('Error saving subsidy matches:', error);
    throw error;
  }
  
  return data || [];
}

/**
 * Get subsidy matches for an assessment
 */
export async function getSubsidyMatches(assessmentId: string): Promise<SubsidyMatch[]> {
  const { data, error } = await supabase
    .from('subsidy_matches')
    .select('*')
    .eq('assessment_id', assessmentId)
    .order('match_score', { ascending: false });
  
  if (error) {
    console.error('Error fetching subsidy matches:', error);
    throw error;
  }
  
  return data || [];
}

/**
 * Delete an assessment (and its subsidy matches via cascade)
 */
export async function deleteAssessment(id: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('assessments')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);
  
  if (error) {
    console.error('Error deleting assessment:', error);
    throw error;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  return !!user;
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export default {
  saveFarmerProfile,
  getFarmerProfile,
  saveAssessment,
  getLatestAssessment,
  getAssessmentHistory,
  getAssessmentById,
  saveSubsidyMatches,
  getSubsidyMatches,
  deleteAssessment,
  isAuthenticated,
  getCurrentUser,
};
