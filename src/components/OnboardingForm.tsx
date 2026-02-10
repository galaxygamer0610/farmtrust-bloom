import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft, User, Wallet, Sprout, CheckCircle2, MapPin, CloudRain, Shield } from "lucide-react";

export interface FarmerFormData {
  // Step 1: Personal & Operational
  name: string;
  village: string;
  farmSize: string;
  mainCrop: string;
  region: string;
  operationQuarter: string;

  // Step 2: Financial Health (farmer-friendly)
  revenue: string;
  expenses: string;
  whatYouOwe: string;
  whatYouOwn: string;
  savingsHabit: string;
  mobileWallet: string;
  repaymentHistory: string;

  // Step 3: Farm Health
  cropHealth: string;
  soilQuality: string;
  yieldHistory: string;
  irrigationAccess: string;
  sustainablePractices: string;

  // Step 4: Risk & Resilience
  rainfallPattern: string;
  floodRisk: string;
  commodityPriceIndex: string;
  policySupportScore: string;

  // Loan request
  loanAmount: string;
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

const regionOptions = [
  { label: "🏜️ Arid / Dry", value: "arid" },
  { label: "🌾 Fertile Plains", value: "fertile" },
  { label: "⛰️ Hilly / Mountainous", value: "hilly" },
  { label: "🌊 Coastal", value: "coastal" },
  { label: "🌿 Tropical / Humid", value: "tropical" },
];

const quarterOptions = [
  { label: "🌱 Kharif (Jun–Oct)", value: "kharif" },
  { label: "🌾 Rabi (Nov–Mar)", value: "rabi" },
  { label: "☀️ Zaid (Mar–Jun)", value: "zaid" },
  { label: "📅 Year-Round", value: "yearround" },
];

const RatingSelector = ({ field, label, value, onChange }: { field: string; label: string; value: string; onChange: (v: string) => void }) => (
  <div>
    <Label className="mb-2 block text-foreground">{label}</Label>
    <div className="flex flex-wrap gap-2">
      {ratingOptions.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
            value === opt.value
              ? "border-secondary bg-secondary/10 text-secondary"
              : "border-border bg-card text-muted-foreground hover:border-secondary/40"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  </div>
);

const OnboardingForm = ({ onComplete }: OnboardingFormProps) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FarmerFormData>({
    name: "", village: "", farmSize: "", mainCrop: "",
    region: "fertile", operationQuarter: "kharif",
    revenue: "", expenses: "", whatYouOwe: "0", whatYouOwn: "0",
    savingsHabit: "60", mobileWallet: "60", repaymentHistory: "60",
    cropHealth: "60", soilQuality: "60", yieldHistory: "60",
    irrigationAccess: "60", sustainablePractices: "60",
    rainfallPattern: "60", floodRisk: "60",
    commodityPriceIndex: "60", policySupportScore: "60",
    loanAmount: "50000",
  });

  const update = (field: keyof FarmerFormData, value: string) => setData(prev => ({ ...prev, [field]: value }));

  const steps = [
    {
      title: "Tell us about you & your land 👋",
      subtitle: "Your farm's identity",
      icon: User,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-foreground">Your Name</Label>
              <Input placeholder="e.g. Ramesh Kumar" value={data.name} onChange={e => update("name", e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-foreground">Village / Town</Label>
              <Input placeholder="e.g. Chandpur" value={data.village} onChange={e => update("village", e.target.value)} className="mt-1" />
            </div>
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
          <div>
            <Label className="mb-2 block text-foreground">🌍 What's your region like?</Label>
            <div className="flex flex-wrap gap-2">
              {regionOptions.map(opt => (
                <button key={opt.value} type="button" onClick={() => update("region", opt.value)}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                    data.region === opt.value ? "border-secondary bg-secondary/10 text-secondary" : "border-border bg-card text-muted-foreground hover:border-secondary/40"
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label className="mb-2 block text-foreground">📅 When do you mostly farm?</Label>
            <div className="flex flex-wrap gap-2">
              {quarterOptions.map(opt => (
                <button key={opt.value} type="button" onClick={() => update("operationQuarter", opt.value)}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                    data.operationQuarter === opt.value ? "border-secondary bg-secondary/10 text-secondary" : "border-border bg-card text-muted-foreground hover:border-secondary/40"
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Your Money Story 💰",
      subtitle: "Let's understand your farm's finances — in simple terms",
      icon: Wallet,
      content: (
        <div className="space-y-5">
          <div className="rounded-xl border border-secondary/20 bg-secondary/5 p-4">
            <p className="mb-3 text-sm font-medium text-foreground">💡 Think of it like this:</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-foreground">How much did you earn last season? (₹)</Label>
                <Input type="number" placeholder="e.g. 200000" value={data.revenue} onChange={e => update("revenue", e.target.value)} className="mt-1" />
                <p className="mt-1 text-xs text-muted-foreground">Total from selling crops, milk, etc.</p>
              </div>
              <div>
                <Label className="text-foreground">How much did you spend? (₹)</Label>
                <Input type="number" placeholder="e.g. 120000" value={data.expenses} onChange={e => update("expenses", e.target.value)} className="mt-1" />
                <p className="mt-1 text-xs text-muted-foreground">Seeds, fertilizer, labour, fuel, etc.</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-kisan-gold/20 bg-kisan-gold/5 p-4">
            <p className="mb-3 text-sm font-medium text-foreground">⚖️ What you owe vs. What you own</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-foreground">What you owe (₹)</Label>
                <Input type="number" placeholder="e.g. 50000" value={data.whatYouOwe} onChange={e => update("whatYouOwe", e.target.value)} className="mt-1" />
                <p className="mt-1 text-xs text-muted-foreground">Any existing loans, debts</p>
              </div>
              <div>
                <Label className="text-foreground">What you own (₹)</Label>
                <Input type="number" placeholder="e.g. 300000" value={data.whatYouOwn} onChange={e => update("whatYouOwn", e.target.value)} className="mt-1" />
                <p className="mt-1 text-xs text-muted-foreground">Land, animals, equipment value</p>
              </div>
            </div>
          </div>
          <div>
            <Label className="text-foreground">How much loan are you looking for? (₹)</Label>
            <Input type="number" placeholder="e.g. 50000" value={data.loanAmount} onChange={e => update("loanAmount", e.target.value)} className="mt-1" />
          </div>
          <div className="space-y-4">
            <RatingSelector field="repaymentHistory" label="Have you repaid past loans on time?" value={data.repaymentHistory} onChange={v => update("repaymentHistory", v)} />
            <RatingSelector field="mobileWallet" label="How often do you use mobile payments?" value={data.mobileWallet} onChange={v => update("mobileWallet", v)} />
            <RatingSelector field="savingsHabit" label="Do you save money regularly?" value={data.savingsHabit} onChange={v => update("savingsHabit", v)} />
          </div>
        </div>
      ),
    },
    {
      title: "Your Farm Health 🌾",
      subtitle: "Tell us about your land and practices",
      icon: Sprout,
      content: (
        <div className="space-y-4">
          <RatingSelector field="cropHealth" label="How healthy are your crops right now?" value={data.cropHealth} onChange={v => update("cropHealth", v)} />
          <RatingSelector field="soilQuality" label="How fertile is your soil?" value={data.soilQuality} onChange={v => update("soilQuality", v)} />
          <RatingSelector field="yieldHistory" label="How was your last harvest?" value={data.yieldHistory} onChange={v => update("yieldHistory", v)} />
          <RatingSelector field="irrigationAccess" label="How reliable is your water supply?" value={data.irrigationAccess} onChange={v => update("irrigationAccess", v)} />
          <RatingSelector field="sustainablePractices" label="Do you use organic / eco-friendly methods?" value={data.sustainablePractices} onChange={v => update("sustainablePractices", v)} />
        </div>
      ),
    },
    {
      title: "Risk & Safety Net 🛡️",
      subtitle: "Things that protect your farm from bad seasons",
      icon: Shield,
      content: (
        <div className="space-y-5">
          <div className="rounded-xl border border-kisan-sky/20 bg-kisan-sky/5 p-4">
            <p className="mb-1 text-sm font-medium text-foreground">☁️ Don't worry — even if rainfall is bad, government support can keep your score strong.</p>
            <p className="text-xs text-muted-foreground">We "curve" your score based on your region, so drought-prone farmers aren't unfairly penalized.</p>
          </div>
          <RatingSelector field="rainfallPattern" label="How reliable is rainfall in your area?" value={data.rainfallPattern} onChange={v => update("rainfallPattern", v)} />
          <RatingSelector field="floodRisk" label="Has your area faced floods in recent years?" value={data.floodRisk} onChange={v => update("floodRisk", v)} />
          <RatingSelector field="commodityPriceIndex" label="Are crop prices stable in your market?" value={data.commodityPriceIndex} onChange={v => update("commodityPriceIndex", v)} />
          <RatingSelector field="policySupportScore" label="Do you have access to government schemes / crop insurance?" value={data.policySupportScore} onChange={v => update("policySupportScore", v)} />
        </div>
      ),
    },
  ];

  const canProceed = step === 0
    ? data.name && data.village && data.farmSize && data.mainCrop
    : step === 1
    ? data.revenue && data.expenses
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
