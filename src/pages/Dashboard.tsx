import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import CreditScorePlant from "@/components/CreditScorePlant";
import ScoreBreakdown from "@/components/ScoreBreakdown";
import SubsidyRewards from "@/components/SubsidyRewards";
import HarvestMeter from "@/components/HarvestMeter";
import { TrendingUp, Percent, Clock, ArrowRight, Loader2 } from "lucide-react";
import { getLatestAssessment, getFarmerProfile, isAuthenticated } from "@/services/database";

interface KisanData {
  name: string;
  village: string;
  farmSize: string;
  mainCrop: string;
  region: string;
  financialScore: number;
  agriculturalScore: number;
  resilienceScore: number;
  enablerScore: number;
  overallScore: number;
  loanAmount: string;
  regionCurve: number;
  // Backend-specific fields (optional)
  probability_of_default?: number;
  risk_category?: string;
  lending_recommendation?: string;
  top_features?: Array<{
    label: string;
    value: number;
    importance: number;
  }>;
  eligible_subsidies?: Array<{
    scheme_id: string;
    scheme_name: string;
    benefits: string;
    match_score: number;
  }>;
  model_version?: string;
  assessed_at?: string;
}

const defaultData: KisanData = {
  name: "Ramesh Kumar",
  village: "Chandpur",
  farmSize: "5",
  mainCrop: "Wheat",
  region: "fertile",
  financialScore: 72,
  agriculturalScore: 68,
  resilienceScore: 65,
  enablerScore: 60,
  overallScore: 70,
  loanAmount: "50000",
  regionCurve: 1.0,
};

const Dashboard = () => {
  const [data, setData] = useState<KisanData>(defaultData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Check if user is authenticated
      const authenticated = await isAuthenticated();

      if (authenticated) {
        // Try to load from database
        const [assessment, profile] = await Promise.all([
          getLatestAssessment(),
          getFarmerProfile(),
        ]);

        if (assessment && profile) {
          // Map database data to dashboard format
          setData({
            name: profile.name,
            village: profile.village || '',
            farmSize: profile.farm_size?.toString() || '0',
            mainCrop: profile.main_crop || '',
            region: profile.region || 'fertile',
            financialScore: assessment.financial_score || 70,
            agriculturalScore: assessment.agricultural_score || 70,
            resilienceScore: assessment.resilience_score || 70,
            enablerScore: assessment.enabler_score || 70,
            overallScore: Math.round(assessment.credit_score),
            loanAmount: (assessment.loan_amount * 1000).toString(), // Convert back to full amount
            regionCurve: 1.0,
            // Backend-specific fields
            probability_of_default: assessment.probability_of_default,
            risk_category: assessment.risk_category,
            lending_recommendation: assessment.lending_recommendation,
            model_version: assessment.model_version,
            assessed_at: assessment.assessed_at,
          });
          console.log('Data loaded from database');
        } else {
          // Fall back to sessionStorage
          const stored = sessionStorage.getItem("kisanData");
          if (stored) {
            setData(JSON.parse(stored));
            console.log('Data loaded from sessionStorage');
          }
        }
      } else {
        // Not authenticated, use sessionStorage
        const stored = sessionStorage.getItem("kisanData");
        if (stored) {
          setData(JSON.parse(stored));
          console.log('Data loaded from sessionStorage (not authenticated)');
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // Fall back to sessionStorage on error
      const stored = sessionStorage.getItem("kisanData");
      if (stored) {
        setData(JSON.parse(stored));
      }
    } finally {
      setLoading(false);
    }
  };

  const getInterestRate = (score: number) => {
    if (score >= 80) return 6.5;
    if (score >= 60) return 8.5;
    if (score >= 40) return 11;
    return 14;
  };

  const getApprovalTime = (score: number) => {
    if (score >= 80) return "24 hours";
    if (score >= 60) return "3 days";
    if (score >= 40) return "7 days";
    return "14 days";
  };

  const rate = getInterestRate(data.overallScore);
  const approvalTime = getApprovalTime(data.overallScore);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="font-display text-3xl font-bold text-foreground">
                Namaste, {data.name} 🙏
              </h1>
              <p className="text-muted-foreground">
                {data.farmSize} acres in {data.village} · Growing {data.mainCrop}
              </p>
            </motion.div>

        {/* Top Row: Plant + Quick Stats */}
        <div className="mb-8 grid gap-6 lg:grid-cols-3">
          <motion.div
            className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-6 shadow-card lg:col-span-1"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="mb-2 font-display text-lg font-bold text-foreground">Your Trust Score</h2>
            <CreditScorePlant score={data.overallScore} />
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-3 lg:col-span-2 lg:grid-cols-3">
            {[
              {
                icon: TrendingUp,
                label: "Credit Score",
                value: `${data.overallScore}/100`,
                sub: data.overallScore >= 60 ? "Eligible for loans ✅" : "Keep improving 💪",
                color: "bg-primary/10 text-primary",
              },
              {
                icon: Percent,
                label: "Interest Rate",
                value: `${rate}%`,
                sub: rate <= 8 ? "Best rate available 🌟" : "Improve score for lower rates",
                color: "bg-secondary/10 text-secondary",
              },
              {
                icon: Clock,
                label: "Approval Time",
                value: approvalTime,
                sub: data.overallScore >= 80 ? "Fast-track approval ⚡" : "Build trust for faster access",
                color: "bg-kisan-leaf/10 text-kisan-leaf",
              },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="mt-auto pt-2 text-xs text-muted-foreground">{stat.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Harvest Meter */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <HarvestMeter
            score={data.overallScore}
            loanAmount={parseInt(data.loanAmount) || 50000}
          />
        </motion.div>

        {/* Score Breakdown */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <ScoreBreakdown
            financialScore={data.financialScore}
            agriculturalScore={data.agriculturalScore}
            resilienceScore={data.resilienceScore}
            enablerScore={data.enablerScore}
            regionCurve={data.regionCurve}
          />
        </motion.div>

        {/* Subsidy Rewards */}
        <motion.div
          className="mb-8 rounded-2xl border border-border bg-card p-6 shadow-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <SubsidyRewards score={data.overallScore} />
        </motion.div>

        {/* Backend ML Insights (if available) */}
        {data.risk_category && (
          <motion.div
            className="mb-8 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 p-6 shadow-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <h2 className="mb-4 font-display text-xl font-bold text-foreground">
              🤖 AI-Powered Insights
            </h2>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-sm text-muted-foreground">Risk Category</p>
                <p className="font-display text-lg font-bold text-foreground">{data.risk_category}</p>
              </div>
              
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-sm text-muted-foreground">Default Probability</p>
                <p className="font-display text-lg font-bold text-foreground">
                  {((data.probability_of_default || 0) * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            {data.lending_recommendation && (
              <div className="mt-4 rounded-lg border border-secondary/20 bg-secondary/5 p-4">
                <p className="text-sm font-medium text-muted-foreground">Lending Recommendation</p>
                <p className="mt-1 text-foreground">{data.lending_recommendation}</p>
              </div>
            )}

            {data.top_features && data.top_features.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-sm font-medium text-muted-foreground">Top Factors Affecting Your Score</p>
                <div className="space-y-2">
                  {data.top_features.slice(0, 3).map((feature, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{feature.label}</p>
                        <p className="text-xs text-muted-foreground">Value: {feature.value.toFixed(3)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-primary">{feature.importance.toFixed(1)}%</p>
                        <p className="text-xs text-muted-foreground">importance</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.model_version && (
              <p className="mt-4 text-xs text-muted-foreground">
                Model: {data.model_version} · Assessed: {data.assessed_at ? new Date(data.assessed_at).toLocaleString() : 'N/A'}
              </p>
            )}
          </motion.div>
        )}

        {/* CTA */}
        {!sessionStorage.getItem("kisanData") && (
          <motion.div
            className="rounded-2xl bg-gradient-hero p-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <h3 className="mb-2 font-display text-xl font-bold text-primary-foreground">
              This is a demo. Calculate your real score!
            </h3>
            <p className="mb-4 text-sm text-primary-foreground/80">
              Enter your actual farm data for a personalized trust score.
            </p>
            <Link to="/onboarding">
              <Button className="bg-gradient-gold text-primary-foreground gap-2 hover:opacity-90">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        )}
      </>
    )}
      </div>
    </div>
  );
};

export default Dashboard;
