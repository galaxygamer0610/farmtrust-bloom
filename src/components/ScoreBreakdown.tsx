import { motion } from "framer-motion";
import { Sprout, Wallet, Droplets, Leaf, TrendingUp, Sun } from "lucide-react";

interface ScoreCategory {
  label: string;
  value: number;
  max: number;
  icon: React.ElementType;
}

interface ScoreBreakdownProps {
  financialScore: number;
  agriculturalScore: number;
}

const ScoreBreakdown = ({ financialScore, agriculturalScore }: ScoreBreakdownProps) => {
  const financialItems: ScoreCategory[] = [
    { label: "Repayment History", value: Math.round(financialScore * 0.4), max: 40, icon: TrendingUp },
    { label: "Mobile Wallet Activity", value: Math.round(financialScore * 0.35), max: 35, icon: Wallet },
    { label: "Savings Habits", value: Math.round(financialScore * 0.25), max: 25, icon: Sun },
  ];

  const agriculturalItems: ScoreCategory[] = [
    { label: "Crop Health", value: Math.round(agriculturalScore * 0.25), max: 25, icon: Sprout },
    { label: "Soil Quality", value: Math.round(agriculturalScore * 0.25), max: 25, icon: Leaf },
    { label: "Yield History", value: Math.round(agriculturalScore * 0.2), max: 20, icon: TrendingUp },
    { label: "Irrigation Access", value: Math.round(agriculturalScore * 0.15), max: 15, icon: Droplets },
    { label: "Sustainable Practices", value: Math.round(agriculturalScore * 0.15), max: 15, icon: Leaf },
  ];

  const BarItem = ({ item, delay }: { item: ScoreCategory; delay: number }) => (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <item.icon className="h-4 w-4 text-secondary" />
          <span className="font-medium text-foreground">{item.label}</span>
        </div>
        <span className="text-muted-foreground">{item.value}/{item.max}</span>
      </div>
      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
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
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-xl border border-border bg-card p-5 shadow-card">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-gold">
            <Wallet className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-foreground">Financial Reliability</h3>
            <p className="text-xs text-muted-foreground">Score: {financialScore}/100</p>
          </div>
        </div>
        <div className="space-y-3">
          {financialItems.map((item, i) => (
            <BarItem key={item.label} item={item} delay={0.3 + i * 0.15} />
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-card">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-hero">
            <Sprout className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-foreground">Agricultural Potential</h3>
            <p className="text-xs text-muted-foreground">Score: {agriculturalScore}/100</p>
          </div>
        </div>
        <div className="space-y-3">
          {agriculturalItems.map((item, i) => (
            <BarItem key={item.label} item={item} delay={0.3 + i * 0.15} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScoreBreakdown;
