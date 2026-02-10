import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft, User, Wallet, Sprout, CheckCircle2 } from "lucide-react";

export interface FarmerFormData {
  name: string;
  village: string;
  farmSize: string;
  mainCrop: string;
  repaymentHistory: string;
  mobileWallet: string;
  savingsHabit: string;
  cropHealth: string;
  soilQuality: string;
  yieldHistory: string;
  irrigationAccess: string;
  sustainablePractices: string;
}

interface OnboardingFormProps {
  onComplete: (data: FarmerFormData) => void;
}

const ratingOptions = [
  { label: "😟 Poor", value: "20" },
  { label: "😐 Fair", value: "40" },
  { label: "🙂 Good", value: "60" },
  { label: "😊 Very Good", value: "80" },
  { label: "🌟 Excellent", value: "100" },
];

const OnboardingForm = ({ onComplete }: OnboardingFormProps) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FarmerFormData>({
    name: "", village: "", farmSize: "", mainCrop: "",
    repaymentHistory: "60", mobileWallet: "60", savingsHabit: "60",
    cropHealth: "60", soilQuality: "60", yieldHistory: "60",
    irrigationAccess: "60", sustainablePractices: "60",
  });

  const update = (field: keyof FarmerFormData, value: string) => setData(prev => ({ ...prev, [field]: value }));

  const steps = [
    {
      title: "Tell us about yourself 👋",
      subtitle: "Basic information",
      icon: User,
      content: (
        <div className="space-y-4">
          <div>
            <Label className="text-foreground">Your Name</Label>
            <Input placeholder="e.g. Ramesh Kumar" value={data.name} onChange={e => update("name", e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-foreground">Village / Town</Label>
            <Input placeholder="e.g. Chandpur" value={data.village} onChange={e => update("village", e.target.value)} className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-foreground">Farm Size (acres)</Label>
              <Input type="number" placeholder="e.g. 5" value={data.farmSize} onChange={e => update("farmSize", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-foreground">Main Crop</Label>
              <Input placeholder="e.g. Wheat" value={data.mainCrop} onChange={e => update("mainCrop", e.target.value)} className="mt-1" />
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Your Financial Habits 💰",
      subtitle: "How do you manage money?",
      icon: Wallet,
      content: (
        <div className="space-y-5">
          {([
            { field: "repaymentHistory" as const, label: "How well do you repay loans?" },
            { field: "mobileWallet" as const, label: "How often do you use mobile payments?" },
            { field: "savingsHabit" as const, label: "How are your savings habits?" },
          ]).map(({ field, label }) => (
            <div key={field}>
              <Label className="mb-2 block text-foreground">{label}</Label>
              <div className="flex flex-wrap gap-2">
                {ratingOptions.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => update(field, opt.value)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                      data[field] === opt.value
                        ? "border-secondary bg-secondary/10 text-secondary"
                        : "border-border bg-card text-muted-foreground hover:border-secondary/40"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Your Farm Health 🌾",
      subtitle: "Tell us about your land",
      icon: Sprout,
      content: (
        <div className="space-y-5">
          {([
            { field: "cropHealth" as const, label: "How healthy are your crops?" },
            { field: "soilQuality" as const, label: "How is your soil quality?" },
            { field: "yieldHistory" as const, label: "How was your last harvest?" },
            { field: "irrigationAccess" as const, label: "How good is your irrigation?" },
            { field: "sustainablePractices" as const, label: "Do you use organic / green methods?" },
          ]).map(({ field, label }) => (
            <div key={field}>
              <Label className="mb-2 block text-foreground">{label}</Label>
              <div className="flex flex-wrap gap-2">
                {ratingOptions.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => update(field, opt.value)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                      data[field] === opt.value
                        ? "border-secondary bg-secondary/10 text-secondary"
                        : "border-border bg-card text-muted-foreground hover:border-secondary/40"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ),
    },
  ];

  const canProceed = step === 0
    ? data.name && data.village && data.farmSize && data.mainCrop
    : true;

  return (
    <div className="mx-auto max-w-xl">
      {/* Progress */}
      <div className="mb-6 flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={i} className="flex flex-1 items-center gap-2">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${
              i < step ? "bg-kisan-leaf text-primary-foreground" :
              i === step ? "bg-gradient-gold text-primary-foreground" :
              "bg-muted text-muted-foreground"
            }`}>
              {i < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 flex-1 rounded ${i < step ? "bg-kisan-leaf" : "bg-muted"}`} />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-4">
            <h2 className="font-display text-2xl font-bold text-foreground">{steps[step].title}</h2>
            <p className="text-sm text-muted-foreground">{steps[step].subtitle}</p>
          </div>
          {steps[step].content}
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 flex justify-between">
        <Button
          variant="outline"
          onClick={() => setStep(s => s - 1)}
          disabled={step === 0}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        {step < steps.length - 1 ? (
          <Button
            onClick={() => setStep(s => s + 1)}
            disabled={!canProceed}
            className="gap-2 bg-gradient-gold text-primary-foreground hover:opacity-90"
          >
            Next <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={() => onComplete(data)}
            className="gap-2 bg-gradient-hero text-primary-foreground hover:opacity-90"
          >
            Calculate My Score 🌱
          </Button>
        )}
      </div>
    </div>
  );
};

export default OnboardingForm;
