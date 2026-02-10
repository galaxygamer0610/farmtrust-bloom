import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import OnboardingForm from "@/components/OnboardingForm";
import type { FarmerFormData } from "@/components/OnboardingForm";

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

  const handleComplete = (data: FarmerFormData) => {
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
    // The "Resilience Buffer": High policy support offsets bad rainfall
    const rawRisk = Math.round(
      p(data.rainfallPattern) * 0.3 +
      p(data.floodRisk) * 0.25 +
      p(data.commodityPriceIndex) * 0.2 +
      p(data.policySupportScore) * 0.25
    );
    // If policy support is high (≥80), boost resilience even if rainfall is poor
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

    sessionStorage.setItem("kisanData", JSON.stringify({
      ...data,
      financialScore,
      agriculturalScore,
      resilienceScore,
      enablerScore,
      overallScore,
      netProfit,
      debtToEquity,
      regionCurve: curve,
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
          <p className="text-muted-foreground">4 simple steps · Takes about 5 minutes · Every detail helps your score</p>
        </motion.div>
        <OnboardingForm onComplete={handleComplete} />
      </div>
    </div>
  );
};

export default Onboarding;
