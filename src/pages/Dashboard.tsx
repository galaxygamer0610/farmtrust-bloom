import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import CreditScorePlant from "@/components/CreditScorePlant";
import ScoreBreakdown from "@/components/ScoreBreakdown";
import SubsidyRewards from "@/components/SubsidyRewards";
import { TrendingUp, Percent, Clock, ArrowRight } from "lucide-react";

interface KisanData {
  name: string;
  village: string;
  farmSize: string;
  mainCrop: string;
  financialScore: number;
  agriculturalScore: number;
  overallScore: number;
}

const defaultData: KisanData = {
  name: "Ramesh Kumar",
  village: "Chandpur",
  farmSize: "5",
  mainCrop: "Wheat",
  financialScore: 72,
  agriculturalScore: 68,
  overallScore: 70,
};

const Dashboard = () => {
  const [data, setData] = useState<KisanData>(defaultData);

  useEffect(() => {
    const stored = sessionStorage.getItem("kisanData");
    if (stored) {
      setData(JSON.parse(stored));
    }
  }, []);

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
      </div>
    </div>
  );
};

export default Dashboard;
