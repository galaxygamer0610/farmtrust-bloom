export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      farmers: {
        Row: {
          id: string
          user_id: string | null
          full_name: string
          email: string
          phone: string | null
          farm_name: string | null
          farm_location: string | null
          farm_size_acres: number | null
          crop_types: string[] | null
          years_farming: number | null
          government_id: string | null
          bank_account_number: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          full_name: string
          email: string
          phone?: string | null
          farm_name?: string | null
          farm_location?: string | null
          farm_size_acres?: number | null
          crop_types?: string[] | null
          years_farming?: number | null
          government_id?: string | null
          bank_account_number?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          full_name?: string
          email?: string
          phone?: string | null
          farm_name?: string | null
          farm_location?: string | null
          farm_size_acres?: number | null
          crop_types?: string[] | null
          years_farming?: number | null
          government_id?: string | null
          bank_account_number?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      credit_scores: {
        Row: {
          id: string
          farmer_id: string | null
          overall_score: number | null
          payment_history_score: number | null
          farm_productivity_score: number | null
          financial_stability_score: number | null
          market_engagement_score: number | null
          risk_level: string | null
          credit_limit: number | null
          calculated_at: string
          last_updated: string
        }
        Insert: {
          id?: string
          farmer_id?: string | null
          overall_score?: number | null
          payment_history_score?: number | null
          farm_productivity_score?: number | null
          financial_stability_score?: number | null
          market_engagement_score?: number | null
          risk_level?: string | null
          credit_limit?: number | null
          calculated_at?: string
          last_updated?: string
        }
        Update: {
          id?: string
          farmer_id?: string | null
          overall_score?: number | null
          payment_history_score?: number | null
          farm_productivity_score?: number | null
          financial_stability_score?: number | null
          market_engagement_score?: number | null
          risk_level?: string | null
          credit_limit?: number | null
          calculated_at?: string
          last_updated?: string
        }
      }
      subsidies: {
        Row: {
          id: string
          name: string
          description: string | null
          subsidy_type: string | null
          amount: number | null
          eligibility_criteria: Json | null
          min_credit_score: number | null
          max_credit_score: number | null
          available_from: string | null
          available_until: string | null
          is_active: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          subsidy_type?: string | null
          amount?: number | null
          eligibility_criteria?: Json | null
          min_credit_score?: number | null
          max_credit_score?: number | null
          available_from?: string | null
          available_until?: string | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          subsidy_type?: string | null
          amount?: number | null
          eligibility_criteria?: Json | null
          min_credit_score?: number | null
          max_credit_score?: number | null
          available_from?: string | null
          available_until?: string | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      subsidy_applications: {
        Row: {
          id: string
          farmer_id: string | null
          subsidy_id: string | null
          application_status: string | null
          applied_at: string
          reviewed_at: string | null
          reviewer_notes: string | null
          disbursed_at: string | null
          disbursed_amount: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          farmer_id?: string | null
          subsidy_id?: string | null
          application_status?: string | null
          applied_at?: string
          reviewed_at?: string | null
          reviewer_notes?: string | null
          disbursed_at?: string | null
          disbursed_amount?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          farmer_id?: string | null
          subsidy_id?: string | null
          application_status?: string | null
          applied_at?: string
          reviewed_at?: string | null
          reviewer_notes?: string | null
          disbursed_at?: string | null
          disbursed_amount?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          farmer_id: string | null
          transaction_type: string | null
          amount: number
          description: string | null
          transaction_date: string
          payment_status: string | null
          created_at: string
        }
        Insert: {
          id?: string
          farmer_id?: string | null
          transaction_type?: string | null
          amount: number
          description?: string | null
          transaction_date: string
          payment_status?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          farmer_id?: string | null
          transaction_type?: string | null
          amount?: number
          description?: string | null
          transaction_date?: string
          payment_status?: string | null
          created_at?: string
        }
      }
      farm_activities: {
        Row: {
          id: string
          farmer_id: string | null
          activity_type: string | null
          crop_type: string | null
          area_covered: number | null
          activity_date: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          farmer_id?: string | null
          activity_type?: string | null
          crop_type?: string | null
          area_covered?: number | null
          activity_date: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          farmer_id?: string | null
          activity_type?: string | null
          crop_type?: string | null
          area_covered?: number | null
          activity_date?: string
          notes?: string | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          farmer_id: string | null
          title: string
          message: string
          notification_type: string | null
          is_read: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          farmer_id?: string | null
          title: string
          message: string
          notification_type?: string | null
          is_read?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          farmer_id?: string | null
          title?: string
          message?: string
          notification_type?: string | null
          is_read?: boolean | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_overall_credit_score: {
        Args: {
          p_payment_history: number
          p_farm_productivity: number
          p_financial_stability: number
          p_market_engagement: number
        }
        Returns: number
      }
      determine_risk_level: {
        Args: {
          p_credit_score: number
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
