import { motion } from "framer-motion";
import { Sprout, Wallet, Droplets, Leaf, TrendingUp, Sun, Shield, CloudRain, BarChart3, FileCheck } from "lucide-react";

interface ScoreCategory {
  label: string;
  value: number;
  max: number;
  icon: React.ElementType;
}

interface ScoreBreakdownProps {
  financialScore: number;
  agriculturalScore: number;
  resilienceScore?: number;
  enablerScore?: number;
  regionCurve?: number;
}

const ScoreBreakdown = ({ financialScore, agriculturalScore, resilienceScore = 0, enablerScore = 0, regionCurve = 1.0 }: ScoreBreakdownProps) => {
  const pillars = [
    {
      title: "Financial Health",
      subtitle: "25% weight",
      score: financialScore,
      icon: Wallet,
      gradient: "bg-gradient-gold",
      items: [
        { label: "Net Profit Margin", value: Math.round(financialScore * 0.25), max: 25, icon: TrendingUp },
        { label: "What You Owe vs Own", value: Math.round(financialScore * 0.2), max: 20, icon: BarChart3 },
        { label: "Repayment History", value: Math.round(financialScore * 0.25), max: 25, icon: Wallet },
        { label: "Mobile Payments", value: Math.round(financialScore * 0.15), max: 15, icon: Sun },
        { label: "Savings Habits", value: Math.round(financialScore * 0.15), max: 15, icon: Sun },
      ],
    },
    {
      title: "Agricultural Potential",
      subtitle: "35% weight",
      score: agriculturalScore,
      icon: Sprout,
      gradient: "bg-gradient-hero",
      items: [
        { label: "Crop Health", value: Math.round(agriculturalScore * 0.25), max: 25, icon: Sprout },
        { label: "Soil Quality", value: Math.round(agriculturalScore * 0.25), max: 25, icon: Leaf },
        { label: "Yield History", value: Math.round(agriculturalScore * 0.2), max: 20, icon: TrendingUp },
        { label: "Water Supply", value: Math.round(agriculturalScore * 0.15), max: 15, icon: Droplets },
        { label: "Sustainable Practices", value: Math.round(agriculturalScore * 0.15), max: 15, icon: Leaf },
      ],
    },
    {
      title: "Risk & Resilience",
      subtitle: "25% weight",
      score: resilienceScore,
      icon: Shield,
      gradient: "bg-kisan-sky",
      items: [
        { label: "Rainfall Reliability", value: Math.round(resilienceScore * 0.3), max: 30, icon: CloudRain },
        { label: "Flood Safety", value: Math.round(resilienceScore * 0.25), max: 25, icon: Shield },
        { label: "Market Prices", value: Math.round(resilienceScore * 0.2), max: 20, icon: BarChart3 },
        { label: "Policy Buffer", value: Math.round(resilienceScore * 0.25), max: 25, icon: FileCheck },
      ],
    },
    {
      title: "Enablers",
      subtitle: "15% weight",
      score: enablerScore,
      icon: FileCheck,
      gradient: "bg-gradient-earth",
      items: [
        { label: "Government Support", value: Math.round(enablerScore * 0.6), max: 60, icon: FileCheck },
        { label: "Infrastructure Access", value: Math.round(enablerScore * 0.4), max: 40, icon: Sun },
      ],
    },
  ];

  const BarItem = ({ item, delay }: { item: ScoreCategory; delay: number }) => (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <item.icon className="h-3.5 w-3.5 text-secondary" />
          <span className="font-medium text-foreground">{item.label}</span>
        </div>
        <span className="text-muted-foreground">{item.value}/{item.max}</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-gold"
          initial={{ width: 0 }}
          animate={{ width: `${(item.value / item.max) * 100}%` }}
          transition={{ duration: 1, delay, ease: "easeOut" }}
        />
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-xl font-bold text-foreground">📊 Score Breakdown</h3>
        {regionCurve > 1 && (
          <span className="rounded-full border border-kisan-sky/30 bg-kisan-sky/10 px-3 py-1 text-xs font-medium text-kisan-sky">
            Regional curve: +{Math.round((regionCurve - 1) * 100)}% boost
          </span>
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {pillars.map((pillar, pi) => (
          <div key={pillar.title} className="rounded-xl border border-border bg-card p-5 shadow-card">
            <div className="mb-3 flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${pillar.gradient}`}>
                <pillar.icon className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <h4 className="font-display text-base font-bold text-foreground">{pillar.title}</h4>
                <p className="text-xs text-muted-foreground">{pillar.subtitle} · Score: {pillar.score}/100</p>
              </div>
            </div>
            <div className="space-y-2.5">
              {pillar.items.map((item, i) => (
                <BarItem key={item.label} item={item} delay={0.2 + pi * 0.2 + i * 0.1} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScoreBreakdown;
