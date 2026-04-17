// Authentication helper functions for KisanCred
// Handles user authentication, email verification, and session management

import { supabase } from "@/integrations/supabase/client";
import type { User, Session, AuthError } from "@supabase/supabase-js";

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

export const authHelpers = {
  /**
   * Sign up a new user with email and password
   * Sends email verification link automatically
   */
  async signUp(email: string, password: string, fullName: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        return { user: null, session: null, error };
      }

      return {
        user: data.user,
        session: data.session,
        error: null,
      };
    } catch (error) {
      return {
        user: null,
        session: null,
        error: error as AuthError,
      };
    }
  },

  /**
   * Sign in an existing user with email and password
   */
  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { user: null, session: null, error };
      }

      return {
        user: data.user,
        session: data.session,
        error: null,
      };
    } catch (error) {
      return {
        user: null,
        session: null,
        error: error as AuthError,
      };
    }
  },

  /**
   * Sign out the current user
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      
      // Clear session storage
      sessionStorage.removeItem("kisanData");
      sessionStorage.removeItem("kisanUser");
      
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  },

  /**
   * Get the current authenticated user
   */
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      return { user, error };
    } catch (error) {
      return { user: null, error: error as AuthError };
    }
  },

  /**
   * Get the current session
   */
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      return { session, error };
    } catch (error) {
      return { session: null, error: error as AuthError };
    }
  },

  /**
   * Check if user's email is verified
   */
  async isEmailVerified(): Promise<boolean> {
    const { user } = await this.getCurrentUser();
    
    if (!user) return false;
    
    // Check if email is confirmed
    return user.email_confirmed_at !== null && user.email_confirmed_at !== undefined;
  },

  /**
   * Resend email verification
   */
  async resendVerificationEmail(email: string) {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  },

  /**
   * Reset password - sends reset link to email
   */
  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  },

  /**
   * Update password (when user is logged in)
   */
  async updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  },

  /**
   * Check if user has completed onboarding
   */
  async hasCompletedOnboarding(): Promise<boolean> {
    const { user } = await this.getCurrentUser();
    
    if (!user) return false;

    // Check if farmer profile exists
    const { data, error } = await supabase
      .from("farmers")
      .select("id")
      .eq("user_id", user.id)
      .single();

    return !error && data !== null;
  },

  /**
   * Get user's farmer profile ID
   */
  async getFarmerProfileId(): Promise<string | null> {
    const { user } = await this.getCurrentUser();
    
    if (!user) return null;

    const { data, error } = await supabase
      .from("farmers")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (error || !data) return null;

    return data.id;
  },
};
