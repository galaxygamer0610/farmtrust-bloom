import { motion } from "framer-motion";

interface HarvestMeterProps {
  score: number;
  loanAmount: number;
}

const HarvestMeter = ({ score, loanAmount }: HarvestMeterProps) => {
  const qualificationPercent = Math.min(100, Math.round(score * 1.2));
  const qualifiedAmount = Math.round((qualificationPercent / 100) * loanAmount);
  
  const getStage = () => {
    if (qualificationPercent < 30) return { label: "Planting Seeds 🌱", color: "hsl(25, 35%, 40%)" };
    if (qualificationPercent < 50) return { label: "Sprouting 🌿", color: "hsl(120, 25%, 45%)" };
    if (qualificationPercent < 70) return { label: "Growing Strong 🌾", color: "hsl(120, 40%, 40%)" };
    if (qualificationPercent < 90) return { label: "Almost Harvest 🌻", color: "hsl(42, 80%, 55%)" };
    return { label: "Harvest Ready! 🎉", color: "hsl(145, 50%, 30%)" };
  };

  const stage = getStage();

  // Grain icons representing progress
  const totalGrains = 10;
  const filledGrains = Math.round((qualificationPercent / 100) * totalGrains);

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <h3 className="mb-1 font-display text-xl font-bold text-foreground">🌾 Harvest Meter</h3>
      <p className="mb-5 text-sm text-muted-foreground">How close you are to your loan goal</p>

      {/* The meter visualization */}
      <div className="relative mb-4">
        <div className="flex items-end justify-between gap-1">
          {Array.from({ length: totalGrains }).map((_, i) => (
            <motion.div
              key={i}
              className="flex-1 rounded-t-md"
              style={{
                backgroundColor: i < filledGrains ? stage.color : "hsl(40, 20%, 90%)",
                height: `${20 + (i + 1) * 6}px`,
              }}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.4, ease: "easeOut" }}
            />
          ))}
        </div>
        {/* Ground line */}
        <div className="mt-1 h-1 rounded-full bg-kisan-earth/30" />
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between">
        <div>
          <motion.p
            className="font-display text-2xl font-bold text-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            {qualificationPercent}%
          </motion.p>
          <p className="text-sm font-semibold" style={{ color: stage.color }}>{stage.label}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Qualified Amount</p>
          <motion.p
            className="font-display text-xl font-bold text-secondary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            ₹{qualifiedAmount.toLocaleString("en-IN")}
          </motion.p>
          <p className="text-xs text-muted-foreground">of ₹{loanAmount.toLocaleString("en-IN")} requested</p>
        </div>
      </div>
    </div>
  );
};

export default HarvestMeter;
