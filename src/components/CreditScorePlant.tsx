import { motion } from "framer-motion";

interface CreditScorePlantProps {
  score: number; // 0-100
  size?: "sm" | "lg";
}

const CreditScorePlant = ({ score, size = "lg" }: CreditScorePlantProps) => {
  const stages = score <= 20 ? 1 : score <= 40 ? 2 : score <= 60 ? 3 : score <= 80 ? 4 : 5;
  const isLg = size === "lg";
  const w = isLg ? 280 : 160;
  const h = isLg ? 320 : 200;

  const getLabel = () => {
    if (score <= 20) return "Seed 🌱";
    if (score <= 40) return "Sprout 🌿";
    if (score <= 60) return "Growing 🪴";
    if (score <= 80) return "Thriving 🌳";
    return "Blooming 🌻";
  };

  const getColor = () => {
    if (score <= 20) return "hsl(25, 35%, 40%)";
    if (score <= 40) return "hsl(120, 25%, 45%)";
    if (score <= 60) return "hsl(120, 40%, 40%)";
    if (score <= 80) return "hsl(145, 45%, 35%)";
    return "hsl(145, 50%, 30%)";
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width={w} height={h} viewBox="0 0 280 320" className="drop-shadow-lg">
        {/* Ground */}
        <ellipse cx="140" cy="290" rx="100" ry="20" fill="hsl(25, 35%, 35%)" opacity="0.3" />

        {/* Pot */}
        <motion.path
          d="M100 260 L110 300 L170 300 L180 260 Z"
          fill="hsl(25, 50%, 45%)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
        <motion.path
          d="M95 250 L185 250 L185 265 L95 265 Z"
          fill="hsl(25, 50%, 40%)"
          rx="3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />

        {/* Soil in pot */}
        <motion.ellipse
          cx="140" cy="255" rx="42" ry="8"
          fill="hsl(25, 35%, 25%)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        />

        {/* Stem */}
        {stages >= 1 && (
          <motion.line
            x1="140" y1="250" x2="140" y2={stages >= 5 ? 80 : stages >= 4 ? 100 : stages >= 3 ? 140 : stages >= 2 ? 180 : 220}
            stroke={getColor()}
            strokeWidth="5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, delay: 0.5 }}
          />
        )}

        {/* Small leaf pair - stage 2+ */}
        {stages >= 2 && (
          <motion.g
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
          >
            <ellipse cx="120" cy="210" rx="18" ry="8" fill="hsl(120, 35%, 50%)" transform="rotate(-30, 120, 210)" />
            <ellipse cx="160" cy="210" rx="18" ry="8" fill="hsl(120, 35%, 50%)" transform="rotate(30, 160, 210)" />
          </motion.g>
        )}

        {/* Medium leaves - stage 3+ */}
        {stages >= 3 && (
          <motion.g
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.6 }}
          >
            <ellipse cx="110" cy="170" rx="25" ry="10" fill="hsl(120, 40%, 45%)" transform="rotate(-40, 110, 170)" />
            <ellipse cx="170" cy="170" rx="25" ry="10" fill="hsl(120, 40%, 45%)" transform="rotate(40, 170, 170)" />
          </motion.g>
        )}

        {/* Large leaves - stage 4+ */}
        {stages >= 4 && (
          <motion.g
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.6 }}
          >
            <ellipse cx="105" cy="130" rx="30" ry="12" fill="hsl(145, 45%, 40%)" transform="rotate(-35, 105, 130)" />
            <ellipse cx="175" cy="130" rx="30" ry="12" fill="hsl(145, 45%, 40%)" transform="rotate(35, 175, 130)" />
            <ellipse cx="115" cy="100" rx="22" ry="9" fill="hsl(145, 40%, 45%)" transform="rotate(-25, 115, 100)" />
            <ellipse cx="165" cy="100" rx="22" ry="9" fill="hsl(145, 40%, 45%)" transform="rotate(25, 165, 100)" />
          </motion.g>
        )}

        {/* Flower/bloom - stage 5 */}
        {stages >= 5 && (
          <motion.g
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 2.2, duration: 0.8, type: "spring" }}
          >
            {/* Sunflower petals */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => (
              <ellipse
                key={angle}
                cx={140 + Math.cos((angle * Math.PI) / 180) * 20}
                cy={65 + Math.sin((angle * Math.PI) / 180) * 20}
                rx="12"
                ry="6"
                fill="hsl(42, 80%, 55%)"
                transform={`rotate(${angle}, ${140 + Math.cos((angle * Math.PI) / 180) * 20}, ${65 + Math.sin((angle * Math.PI) / 180) * 20})`}
              />
            ))}
            <circle cx="140" cy="65" r="14" fill="hsl(25, 50%, 35%)" />
            <circle cx="140" cy="65" r="10" fill="hsl(25, 45%, 40%)" />
          </motion.g>
        )}
      </svg>

      {/* Score display */}
      <div className="text-center">
        <motion.div
          className="font-display text-3xl font-bold text-primary"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          {score}
          <span className="text-lg text-muted-foreground">/100</span>
        </motion.div>
        <motion.p
          className="text-sm font-semibold text-secondary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {getLabel()}
        </motion.p>
      </div>
    </div>
  );
};

export default CreditScorePlant;
