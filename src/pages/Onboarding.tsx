import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import OnboardingForm from "@/components/OnboardingForm";
import type { FarmerFormData } from "@/components/OnboardingForm";
import { supabaseHelpers } from "@/lib/supabase-helpers";
import { enhancedSupabaseHelpers } from "@/lib/supabase-enhanced-helpers";
import { authHelpers } from "@/lib/auth-helpers";

const Onboarding = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    checkAuthAndLoadEmail();
  }, []);

  const checkAuthAndLoadEmail = async () => {
    try {
      // Check if user is authenticated
      const { user } = await authHelpers.getCurrentUser();
      
      if (!user) {
        toast.error("Please sign in first");
        navigate("/");
        return;
      }

      // Check if email is verified
      const isVerified = await authHelpers.isEmailVerified();
      if (!isVerified) {
        toast.error("Please verify your email first");
        navigate("/");
        return;
      }

      // Check if user has already completed onboarding
      const hasOnboarded = await authHelpers.hasCompletedOnboarding();
      if (hasOnboarded) {
        toast.info("You've already completed onboarding");
        navigate("/dashboard");
        return;
      }

      // Set user email for the form
      setUserEmail(user.email || "");
      setLoading(false);
    } catch (error) {
      console.error("Error checking auth:", error);
      toast.error("Authentication error");
      navigate("/");
    }
  };

  const handleComplete = async (data: FarmerFormData) => {
    try {
      // Get current user
      const { user, error: userError } = await supabaseHelpers.auth.getCurrentUser();
      
      if (userError || !user) {
        toast.error("Please sign in first");
        navigate("/");
        return;
      }

      // Calculate derived fields
      const annualRevenue = parseFloat(data.annualRevenue) || 0;
      const annualExpenses = parseFloat(data.annualExpenses) || 0;
      const loanAmount = parseFloat(data.loanAmount) || 0;

      // Map farming season to quarter
      const seasonToQuarter: Record<string, string> = {
        "Kharif": "Q2", // Jun-Oct
        "Rabi": "Q4",   // Nov-Mar
        "Zaid": "Q1",   // Mar-Jun
      };

      // Map state to region (simplified - in production, use proper mapping)
      const stateToRegion: Record<string, string> = {
        "Rajasthan": "West",
        "Gujarat": "West",
        "Maharashtra": "West",
        "Punjab": "North",
        "Haryana": "North",
        "Uttar Pradesh": "North",
        "Bihar": "North",
        "West Bengal": "East",
        "Odisha": "East",
        "Assam": "East",
        "Tamil Nadu": "South",
        "Karnataka": "South",
        "Kerala": "South",
        "Andhra Pradesh": "South",
        "Telangana": "South",
      };

      const region = stateToRegion[data.state] || "North";
      const quarter = seasonToQuarter[data.farmingSeason] || "Q1";

      // Use enhanced workflow to complete onboarding
      const { data: onboardingResult, error: onboardingError} = 
        await enhancedSupabaseHelpers.workflow.completeOnboarding({
          userId: user.id,
          email: user.email || "",
          farmerName: data.farmerName,
          phoneNumber: data.phoneNumber,
          aadhaarNumber: data.aadhaarNumber,
          farmerId: data.farmerId,
          state: data.state,
          district: data.district,
          region: region,
          farmingSeason: data.farmingSeason,
          quarter: quarter,
          enterpriseSize: data.enterpriseSize,
          annualRevenue: annualRevenue,
          annualExpenses: annualExpenses,
          loanAmount: loanAmount,
          landholdingSize: parseFloat(data.landholdingSize) || 0,
          cropType: data.cropType,
          irrigationType: data.irrigationType,
          landOwnershipStatus: data.landOwnershipStatus,
        });

      if (onboardingError || !onboardingResult) {
        console.error("Error in onboarding:", onboardingError);
        
        // Check if it's a column error
        if (onboardingError?.message?.includes('farmer_id') || onboardingError?.message?.includes('column')) {
          toast.error("Database schema needs to be updated. Please contact support.");
        } else {
          toast.error("Failed to save data. Please try again.");
        }
        return;
      }

      // Store data for backend ML service call
      const mlPayload = {
        // IDs from database
        farmerId: onboardingResult.farmerId,
        financialDataId: onboardingResult.financialDataId,
        
        // Identity
        farmerName: data.farmerName,
        phoneNumber: data.phoneNumber,
        aadhaarNumber: data.aadhaarNumber,
        
        // Location & Timing (mapped)
        state: data.state,
        district: data.district,
        region: region,
        quarter: quarter,
        farmingSeason: data.farmingSeason,
        
        // Core Financial
        enterpriseSize: data.enterpriseSize,
        annualRevenue: annualRevenue,
        annualExpenses: annualExpenses,
        loanAmount: loanAmount,
        
        // Agricultural
        landholdingSize: parseFloat(data.landholdingSize) || 0,
        cropType: data.cropType,
        irrigationType: data.irrigationType,
        landOwnershipStatus: data.landOwnershipStatus,
        
        // Derived fields (calculated in database)
        netProfit: annualRevenue - annualExpenses,
        debtToEquityRatio: annualRevenue > 0 ? loanAmount / (annualRevenue * 2) : 0,
      };

      // Store in session for backend ML service call
      sessionStorage.setItem("kisanData", JSON.stringify(mlPayload));
      
      toast.success("Profile created successfully! Data saved to database.");
      
      // Navigate to dashboard
      navigate("/dashboard");
      
    } catch (error) {
      console.error("Error in onboarding:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading onboarding form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-6 sm:py-8 lg:py-12">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6">
        <motion.div
          className="mb-6 sm:mb-8 lg:mb-10 text-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">Your KisanCred Journey 🌾</h1>
          <p className="mt-2 text-sm sm:text-base lg:text-lg text-muted-foreground">4 simple steps · Takes about 5 minutes · Every detail helps your score</p>
        </motion.div>
        <OnboardingForm onComplete={handleComplete} initialEmail={userEmail} />
      </div>
    </div>
  );
};

export default Onboarding;