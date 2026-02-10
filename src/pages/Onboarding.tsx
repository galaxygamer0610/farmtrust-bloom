import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import OnboardingForm from "@/components/OnboardingForm";
import type { FarmerFormData } from "@/components/OnboardingForm";

const Onboarding = () => {
  const navigate = useNavigate();

  const handleComplete = (data: FarmerFormData) => {
    // Calculate scores from form data
    const financialScore = Math.round(
      (parseInt(data.repaymentHistory) * 0.4 +
        parseInt(data.mobileWallet) * 0.35 +
        parseInt(data.savingsHabit) * 0.25)
    );
    const agriculturalScore = Math.round(
      (parseInt(data.cropHealth) * 0.25 +
        parseInt(data.soilQuality) * 0.25 +
        parseInt(data.yieldHistory) * 0.2 +
        parseInt(data.irrigationAccess) * 0.15 +
        parseInt(data.sustainablePractices) * 0.15)
    );

    // For new farmers, weight agricultural score more heavily
    const overallScore = Math.round(agriculturalScore * 0.6 + financialScore * 0.4);

    // Store in sessionStorage for dashboard
    sessionStorage.setItem("kisanData", JSON.stringify({
      ...data,
      financialScore,
      agriculturalScore,
      overallScore,
    }));

    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-3xl font-bold text-foreground">Your KisanTrust Journey 🌾</h1>
          <p className="text-muted-foreground">It takes just 3 minutes. Answer honestly—every detail helps.</p>
        </motion.div>
        <OnboardingForm onComplete={handleComplete} />
      </div>
    </div>
  );
};

export default Onboarding;
