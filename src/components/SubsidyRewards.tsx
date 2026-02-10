import { motion } from "framer-motion";
import { Sun, Droplets, Sprout, Wrench, CheckCircle2, Lock } from "lucide-react";

interface SubsidyRewardsProps {
  score: number;
}

const subsidies = [
  { title: "Premium Seeds Pack", description: "High-yield, disease-resistant seeds", icon: Sprout, minScore: 30, value: "₹2,500" },
  { title: "Solar Water Pump", description: "Eco-friendly irrigation for your farm", icon: Sun, minScore: 50, value: "₹15,000" },
  { title: "Drip Irrigation Kit", description: "Save 60% water with modern irrigation", icon: Droplets, minScore: 60, value: "₹8,000" },
  { title: "Modern Equipment Grant", description: "Tools to boost your productivity", icon: Wrench, minScore: 75, value: "₹25,000" },
];

const SubsidyRewards = ({ score }: SubsidyRewardsProps) => {
  return (
    <div>
      <h3 className="mb-1 font-display text-xl font-bold text-foreground">🌿 Green Subsidies</h3>
      <p className="mb-4 text-sm text-muted-foreground">Rewards you've earned through your trust score</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {subsidies.map((subsidy, i) => {
          const unlocked = score >= subsidy.minScore;
          return (
            <motion.div
              key={subsidy.title}
              className={`relative overflow-hidden rounded-xl border p-4 transition-colors ${
                unlocked
                  ? "border-secondary/50 bg-card shadow-card"
                  : "border-border bg-muted/50 opacity-70"
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                  unlocked ? "bg-gradient-gold" : "bg-muted"
                }`}>
                  <subsidy.icon className={`h-5 w-5 ${unlocked ? "text-primary-foreground" : "text-muted-foreground"}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-foreground">{subsidy.title}</h4>
                    {unlocked ? (
                      <CheckCircle2 className="h-4 w-4 text-kisan-leaf" />
                    ) : (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{subsidy.description}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Min. score: {subsidy.minScore}</span>
                    <span className={`text-sm font-bold ${unlocked ? "text-secondary" : "text-muted-foreground"}`}>
                      {subsidy.value}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default SubsidyRewards;
