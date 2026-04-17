import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Farmer = Database['public']['Tables']['farmers']['Row'];
type FarmerInsert = Database['public']['Tables']['farmers']['Insert'];
type CreditScore = Database['public']['Tables']['credit_scores']['Row'];
type Subsidy = Database['public']['Tables']['subsidies']['Row'];
type SubsidyApplication = Database['public']['Tables']['subsidy_applications']['Row'];
type Transaction = Database['public']['Tables']['transactions']['Row'];

// =====================================================
// AUTHENTICATION HELPERS
// =====================================================

export const authHelpers = {
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    return { data, error };
  },
};

// =====================================================
// FARMER PROFILE HELPERS
// =====================================================

export const farmerHelpers = {
  async createProfile(farmerData: FarmerInsert) {
    const { data, error } = await supabase
      .from('farmers')
      .insert(farmerData)
      .select()
      .single();
    return { data, error };
  },

  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('farmers')
      .select('*')
      .eq('user_id', userId)
      .single();
    return { data, error };
  },

  async updateProfile(userId: string, updates: Partial<FarmerInsert>) {
    const { data, error } = await supabase
      .from('farmers')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();
    return { data, error };
  },

  async checkProfileExists(userId: string) {
    const { data, error } = await supabase
      .from('farmers')
      .select('id')
      .eq('user_id', userId)
      .single();
    return { exists: !!data && !error, farmerId: data?.id };
  },
};

// =====================================================
// CREDIT SCORE HELPERS
// =====================================================

export const creditScoreHelpers = {
  async getCreditScore(farmerId: string) {
    const { data, error } = await supabase
      .from('credit_scores')
      .select('*')
      .eq('farmer_id', farmerId)
      .single();
    return { data, error };
  },

  async updateCreditScore(farmerId: string, scores: {
    payment_history_score: number;
    farm_productivity_score: number;
    financial_stability_score: number;
    market_engagement_score: number;
  }) {
    // Calculate overall score using the database function
    const { data: overallScore } = await supabase.rpc(
      'calculate_overall_credit_score',
      {
        p_payment_history: scores.payment_history_score,
        p_farm_productivity: scores.farm_productivity_score,
        p_financial_stability: scores.financial_stability_score,
        p_market_engagement: scores.market_engagement_score,
      }
    );

    // Determine risk level
    const { data: riskLevel } = await supabase.rpc('determine_risk_level', {
      p_credit_score: overallScore || 0,
    });

    // Upsert credit score
    const { data, error } = await supabase
      .from('credit_scores')
      .upsert({
        farmer_id: farmerId,
        overall_score: overallScore || 0,
        ...scores,
        risk_level: riskLevel || 'medium',
        last_updated: new Date().toISOString(),
      })
      .select()
      .single();

    return { data, error };
  },
};

// =====================================================
// SUBSIDY HELPERS
// =====================================================

export const subsidyHelpers = {
  async getActiveSubsidies() {
    const { data, error } = await supabase
      .from('subsidies')
      .select('*')
      .eq('is_active', true)
      .order('amount', { ascending: false });
    return { data, error };
  },

  async getEligibleSubsidies(creditScore: number) {
    const { data, error } = await supabase
      .from('subsidies')
      .select('*')
      .eq('is_active', true)
      .lte('min_credit_score', creditScore)
      .gte('max_credit_score', creditScore)
      .order('amount', { ascending: false });
    return { data, error };
  },

  async getSubsidyById(subsidyId: string) {
    const { data, error } = await supabase
      .from('subsidies')
      .select('*')
      .eq('id', subsidyId)
      .single();
    return { data, error };
  },
};

// =====================================================
// SUBSIDY APPLICATION HELPERS
// =====================================================

export const applicationHelpers = {
  async applyForSubsidy(farmerId: string, subsidyId: string) {
    const { data, error } = await supabase
      .from('subsidy_applications')
      .insert({
        farmer_id: farmerId,
        subsidy_id: subsidyId,
        application_status: 'pending',
      })
      .select()
      .single();
    return { data, error };
  },

  async getApplications(farmerId: string) {
    const { data, error } = await supabase
      .from('subsidy_applications')
      .select(`
        *,
        subsidies (*)
      `)
      .eq('farmer_id', farmerId)
      .order('applied_at', { ascending: false });
    return { data, error };
  },

  async getApplicationStatus(applicationId: string) {
    const { data, error } = await supabase
      .from('subsidy_applications')
      .select('application_status')
      .eq('id', applicationId)
      .single();
    return { data, error };
  },

  async checkExistingApplication(farmerId: string, subsidyId: string) {
    const { data, error } = await supabase
      .from('subsidy_applications')
      .select('id, application_status')
      .eq('farmer_id', farmerId)
      .eq('subsidy_id', subsidyId)
      .single();
    return { exists: !!data && !error, application: data };
  },
};

// =====================================================
// TRANSACTION HELPERS
// =====================================================

export const transactionHelpers = {
  async addTransaction(transaction: Database['public']['Tables']['transactions']['Insert']) {
    const { data, error } = await supabase
      .from('transactions')
      .insert(transaction)
      .select()
      .single();
    return { data, error };
  },

  async getTransactions(farmerId: string, limit = 10) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('farmer_id', farmerId)
      .order('transaction_date', { ascending: false })
      .limit(limit);
    return { data, error };
  },

  async getTransactionsByType(farmerId: string, type: string) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('farmer_id', farmerId)
      .eq('transaction_type', type)
      .order('transaction_date', { ascending: false });
    return { data, error };
  },
};

// =====================================================
// NOTIFICATION HELPERS
// =====================================================

export const notificationHelpers = {
  async getNotifications(farmerId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('farmer_id', farmerId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async getUnreadNotifications(farmerId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('farmer_id', farmerId)
      .eq('is_read', false)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async markAsRead(notificationId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .select()
      .single();
    return { data, error };
  },

  async markAllAsRead(farmerId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('farmer_id', farmerId)
      .eq('is_read', false);
    return { data, error };
  },
};

// =====================================================
// FARM ACTIVITY HELPERS
// =====================================================

export const farmActivityHelpers = {
  async addActivity(activity: Database['public']['Tables']['farm_activities']['Insert']) {
    const { data, error } = await supabase
      .from('farm_activities')
      .insert(activity)
      .select()
      .single();
    return { data, error };
  },

  async getActivities(farmerId: string, limit = 20) {
    const { data, error } = await supabase
      .from('farm_activities')
      .select('*')
      .eq('farmer_id', farmerId)
      .order('activity_date', { ascending: false })
      .limit(limit);
    return { data, error };
  },

  async getActivitiesByType(farmerId: string, activityType: string) {
    const { data, error } = await supabase
      .from('farm_activities')
      .select('*')
      .eq('farmer_id', farmerId)
      .eq('activity_type', activityType)
      .order('activity_date', { ascending: false });
    return { data, error };
  },
};

// =====================================================
// EXPORT ALL HELPERS
// =====================================================

export const supabaseHelpers = {
  auth: authHelpers,
  farmer: farmerHelpers,
  creditScore: creditScoreHelpers,
  subsidy: subsidyHelpers,
  application: applicationHelpers,
  transaction: transactionHelpers,
  notification: notificationHelpers,
  farmActivity: farmActivityHelpers,
};
