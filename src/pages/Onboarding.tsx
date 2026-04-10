import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import OnboardingForm from "@/components/OnboardingForm";
import type { FarmerFormData } from "@/components/OnboardingForm";
import { submitAssessment, mapFormDataToBackendRequest, mapBackendResponseToDashboard } from "@/services/api";
import { saveAssessment, saveFarmerProfile, saveSubsidyMatches, isAuthenticated } from "@/services/database";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// Regional curve multipliers — drought-prone regions get a boost
const regionCurve: Record<string, number> = {
  arid: 1.15,
  fertile: 1.0,
  hilly: 1.08,
  coastal: 1.05,
  tropical: 1.02,
};

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComplete = async (data: FarmerFormData) => {
    setIsSubmitting(true);

    try {
      // Check if user is authenticated
      const authenticated = await isAuthenticated();

      // Map frontend form data to backend format
      const backendRequest = mapFormDataToBackendRequest(data);

      console.log('Submitting to backend:', backendRequest);

      // Call backend API
      const response = await submitAssessment(backendRequest);

      console.log('Backend response:', response);

      // Map backend response to dashboard format
      const dashboardData = mapBackendResponseToDashboard(response, data);

      // Save to database if user is authenticated
      if (authenticated) {
        try {
          // Save farmer profile
          await saveFarmerProfile({
            name: data.name,
            village: data.village,
            farm_size: parseFloat(data.farmSize) || 0,
            main_crop: data.mainCrop,
            region: data.region,
          });

          // Save assessment
          const savedAssessment = await saveAssessment({
            enterprise_size: backendRequest.enterprise_size,
            region: backendRequest.region,
            quarter: backendRequest.quarter,
            annual_revenue: backendRequest.annual_revenue,
            annual_expenses: backendRequest.annual_expenses,
            loan_amount: backendRequest.loan_amount,
            landholding_size: backendRequest.landholding_size,
            crop_type: backendRequest.crop_type,
            irrigation_type: backendRequest.irrigation_type,
            credit_score: response.credit_score,
            probability_of_default: response.probability_of_default,
            risk_category: response.risk_category,
            lending_recommendation: response.lending_recommendation,
            financial_score: dashboardData.financialScore,
            agricultural_score: dashboardData.agriculturalScore,
            resilience_score: dashboardData.resilienceScore,
            enabler_score: dashboardData.enablerScore,
            model_version: response.model_version,
            assessed_at: response.assessed_at,
          });

          // Save subsidy matches if available
          if (response.eligible_subsidies && response.eligible_subsidies.length > 0 && savedAssessment.id) {
            await saveSubsidyMatches(
              savedAssessment.id,
              response.eligible_subsidies.map(subsidy => ({
                scheme_id: subsidy.scheme_id,
                scheme_name: subsidy.scheme_name,
                benefits: subsidy.benefits,
                match_score: subsidy.match_score,
              }))
            );
          }

          console.log('Data saved to database successfully');
        } catch (dbError) {
          console.error('Error saving to database:', dbError);
          // Continue anyway - data is still in sessionStorage
        }
      }

      // Store in session storage as backup
      sessionStorage.setItem("kisanData", JSON.stringify(dashboardData));

      // Show success message
      toast({
        title: "Assessment Complete! 🎉",
        description: `Your credit score is ${Math.round(response.credit_score)}. ${authenticated ? 'Data saved to your account.' : 'Sign in to save your data permanently.'}`,
      });

      // Navigate to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error('Assessment error:', error);

      // Fallback to local calculation if backend fails
      toast({
        title: "Using Local Calculation",
        description: "Backend unavailable. Calculating score locally.",
        variant: "destructive",
      });

      // Original local calculation as fallback
      const p = (v: string) => parseInt(v) || 0;

      // --- Pillar 1: Financial Health (25%) ---
      const revenue = p(data.revenue);
      const expenses = p(data.expenses);
      const netProfit = revenue - expenses;
      const profitMargin = revenue > 0 ? Math.min(100, Math.round((netProfit / revenue) * 100)) : 0;

      const owe = p(data.whatYouOwe);
      const own = p(data.whatYouOwn);
      const debtToEquity = own > 0 ? Math.min(100, Math.round((1 - owe / own) * 100)) : (owe === 0 ? 80 : 20);

      const financialScore = Math.round(
        Math.max(0, Math.min(100,
          profitMargin * 0.25 +
          debtToEquity * 0.2 +
          p(data.repaymentHistory) * 0.25 +
          p(data.mobileWallet) * 0.15 +
          p(data.savingsHabit) * 0.15
        ))
      );

      // --- Pillar 2: Agricultural Potential (35%) ---
      const agriculturalScore = Math.round(
        p(data.cropHealth) * 0.25 +
        p(data.soilQuality) * 0.25 +
        p(data.yieldHistory) * 0.2 +
        p(data.irrigationAccess) * 0.15 +
        p(data.sustainablePractices) * 0.15
      );

      // --- Pillar 3: Risk & Resilience (25%) ---
      const rawRisk = Math.round(
        p(data.rainfallPattern) * 0.3 +
        p(data.floodRisk) * 0.25 +
        p(data.commodityPriceIndex) * 0.2 +
        p(data.policySupportScore) * 0.25
      );
      const policyBuffer = p(data.policySupportScore) >= 80 ? 10 : 0;
      const resilienceScore = Math.min(100, rawRisk + policyBuffer);

      // --- Pillar 4: Enablers (15%) ---
      const enablerScore = Math.round(
        p(data.policySupportScore) * 0.6 +
        (p(data.irrigationAccess) + p(data.sustainablePractices)) * 0.2
      );

      // --- Overall Score with Regional Curve ---
      const curve = regionCurve[data.region] || 1.0;
      const rawOverall = Math.round(
        financialScore * 0.25 +
        agriculturalScore * 0.35 +
        resilienceScore * 0.25 +
        enablerScore * 0.15
      );
      const overallScore = Math.min(100, Math.round(rawOverall * curve));

      const localData = {
        ...data,
        financialScore,
        agriculturalScore,
        resilienceScore,
        enablerScore,
        overallScore,
        netProfit,
        debtToEquity,
        regionCurve: curve,
      };

      sessionStorage.setItem("kisanData", JSON.stringify(localData));

      navigate("/dashboard");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-3xl font-bold text-foreground">Your KisanCred Journey 🌾</h1>
          <p className="text-muted-foreground">4 simple steps · Takes about 5 minutes · Every detail helps your score</p>
        </motion.div>

        {isSubmitting && (
          <div className="mb-6 flex items-center justify-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-4">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <p className="text-sm font-medium text-primary">
              Calculating your credit score with AI...
            </p>
          </div>
        )}

        <OnboardingForm onComplete={handleComplete} />
      </div>
    </div>
  );
};

export default Onboarding;