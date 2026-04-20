import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, ArrowLeft, User, Wallet, Sprout, CheckCircle2 } from "lucide-react";

export interface FarmerFormData {
  // Identity & Contact
  farmerName: string;
  email: string; // Added email field
  phoneNumber: string;
  aadhaarNumber: string;
  farmerId: string; // Added Farmer ID field
  
  // Location & Timing
  state: string;
  district: string;
  farmingSeason: string;
  
  // Core Financial & Operational
  enterpriseSize: string;
  annualRevenue: string;
  annualExpenses: string;
  loanAmount: string;
  
  // Agricultural Fields
  landholdingSize: string;
  cropType: string;
  irrigationType: string;
  landOwnershipStatus: string;
}

interface OnboardingFormProps {
  onComplete: (data: FarmerFormData) => void;
  initialEmail?: string;
}

const OnboardingForm = ({ onComplete, initialEmail = "" }: OnboardingFormProps) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FarmerFormData>({
    farmerName: "",
    email: initialEmail, // Pre-fill with authenticated user's email
    phoneNumber: "",
    aadhaarNumber: "",
    farmerId: "",
    state: "",
    district: "",
    farmingSeason: "",
    enterpriseSize: "",
    annualRevenue: "",
    annualExpenses: "",
    loanAmount: "",
    landholdingSize: "",
    cropType: "",
    irrigationType: "",
    landOwnershipStatus: "",
  });

  // Update email when initialEmail changes
  useEffect(() => {
    if (initialEmail) {
      setData(prev => ({ ...prev, email: initialEmail }));
    }
  }, [initialEmail]);

  const update = (field: keyof FarmerFormData, value: string) => 
    setData(prev => ({ ...prev, [field]: value }));

  const steps = [
    {
      title: "Tell us about you 👋",
      subtitle: "Your identity and contact details",
      icon: User,
      content: (
        <div className="space-y-5">
          <div>
            <Label className="mb-2 block text-sm sm:text-base font-medium text-foreground">Farmer Name *</Label>
            <Input 
              placeholder="Enter your full name" 
              value={data.farmerName} 
              onChange={e => update("farmerName", e.target.value)} 
              className="h-11 sm:h-12 text-base" 
            />
          </div>
          
          <div>
            <Label className="mb-2 block text-sm sm:text-base font-medium text-foreground">Email Address *</Label>
            <Input 
              type="email"
              placeholder="your.email@example.com" 
              value={data.email} 
              onChange={e => update("email", e.target.value)} 
              className="h-11 sm:h-12 text-base"
              disabled
            />
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
              ✅ Using your registered email (verified)
            </p>
          </div>
          
          <div>
            <Label className="mb-2 block text-sm sm:text-base font-medium text-foreground">Phone Number *</Label>
            <Input 
              type="tel"
              placeholder="Enter 10-digit mobile number" 
              value={data.phoneNumber} 
              onChange={e => update("phoneNumber", e.target.value)} 
              className="h-11 sm:h-12 text-base"
              maxLength={10}
            />
          </div>
          
          <div>
            <Label className="mb-2 block text-sm sm:text-base font-medium text-foreground">Aadhaar Number *</Label>
            <Input 
              type="text"
              placeholder="Enter 12-digit Aadhaar number" 
              value={data.aadhaarNumber} 
              onChange={e => {
                const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                update("aadhaarNumber", value);
              }} 
              className="h-11 sm:h-12 text-base"
              maxLength={12}
            />
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
              Required for subsidy matching and verification
            </p>
          </div>
          
          <div>
            <Label className="mb-2 block text-sm sm:text-base font-medium text-foreground">Farmer ID *</Label>
            <Input 
              type="text"
              placeholder="Enter your Farmer ID" 
              value={data.farmerId} 
              onChange={e => update("farmerId", e.target.value)} 
              className="h-11 sm:h-12 text-base"
            />
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
              Your unique farmer identification number
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Your Location & Farming Season 📍",
      subtitle: "Where and when do you farm?",
      icon: Sprout,
      content: (
        <div className="space-y-5">
          <div>
            <Label className="mb-2 block text-sm sm:text-base font-medium text-foreground">State *</Label>
            <Input 
              placeholder="Enter your state name" 
              value={data.state} 
              onChange={e => update("state", e.target.value)} 
              className="h-11 sm:h-12 text-base"
            />
          </div>
          
          <div>
            <Label className="mb-2 block text-sm sm:text-base font-medium text-foreground">District *</Label>
            <Input 
              placeholder="Enter your district name" 
              value={data.district} 
              onChange={e => update("district", e.target.value)} 
              className="h-11 sm:h-12 text-base"
            />
          </div>
          
          <div>
            <Label className="mb-3 block text-sm sm:text-base font-medium text-foreground">Farming Season *</Label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "🌱 Kharif", value: "Kharif", desc: "Jun-Oct" },
                { label: "🌾 Rabi", value: "Rabi", desc: "Nov-Mar" },
                { label: "☀️ Zaid", value: "Zaid", desc: "Mar-Jun" },
              ].map(season => (
                <button
                  key={season.value}
                  type="button"
                  onClick={() => update("farmingSeason", season.value)}
                  className={`rounded-lg border p-3 sm:p-4 text-center transition-all ${
                    data.farmingSeason === season.value
                      ? "border-secondary bg-secondary/10 text-secondary ring-2 ring-secondary"
                      : "border-border bg-card text-muted-foreground hover:border-secondary/40 hover:bg-secondary/5"
                  }`}
                >
                  <div className="text-sm sm:text-base font-medium">{season.label}</div>
                  <div className="mt-1 text-xs opacity-70">{season.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Your Farm Details 🌾",
      subtitle: "Tell us about your land and crops",
      icon: Sprout,
      content: (
        <div className="space-y-5">
          <div>
            <Label className="mb-2 block text-sm sm:text-base font-medium text-foreground">Landholding Size (acres) *</Label>
            <Input 
              type="number"
              step="0.01"
              placeholder="Enter land size in acres" 
              value={data.landholdingSize} 
              onChange={e => update("landholdingSize", e.target.value)} 
              className="h-11 sm:h-12 text-base"
            />
          </div>
          
          <div>
            <Label className="mb-2 block text-sm sm:text-base font-medium text-foreground">Crop Type *</Label>
            <Select value={data.cropType} onValueChange={v => update("cropType", v)}>
              <SelectTrigger className="h-11 sm:h-12 text-base">
                <SelectValue placeholder="Select your main crop" />
              </SelectTrigger>
              <SelectContent>
                {["Wheat", "Rice", "Cotton", "Maize", "Pulses", "Vegetables", "Groundnut"].map(crop => (
                  <SelectItem key={crop} value={crop} className="text-base">{crop}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="mb-2 block text-sm sm:text-base font-medium text-foreground">Irrigation Type *</Label>
            <Select value={data.irrigationType} onValueChange={v => update("irrigationType", v)}>
              <SelectTrigger className="h-11 sm:h-12 text-base">
                <SelectValue placeholder="Select irrigation method" />
              </SelectTrigger>
              <SelectContent>
                {["Rainfed", "Canal", "Borewell", "Sprinkler", "Drip"].map(type => (
                  <SelectItem key={type} value={type} className="text-base">{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="mb-2 block text-sm sm:text-base font-medium text-foreground">Land Ownership Status</Label>
            <Select value={data.landOwnershipStatus} onValueChange={v => update("landOwnershipStatus", v)}>
              <SelectTrigger className="h-11 sm:h-12 text-base">
                <SelectValue placeholder="Select ownership status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Owned" className="text-base">Owned</SelectItem>
                <SelectItem value="Leased" className="text-base">Leased</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      ),
    },
    {
      title: "Financial Information 💰",
      subtitle: "Help us understand your farm's finances",
      icon: Wallet,
      content: (
        <div className="space-y-5">
          <div>
            <Label className="mb-2 block text-sm sm:text-base font-medium text-foreground">Enterprise Size *</Label>
            <Select value={data.enterpriseSize} onValueChange={v => update("enterpriseSize", v)}>
              <SelectTrigger className="h-11 sm:h-12 text-base">
                <SelectValue placeholder="Select farm size category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Small" className="text-base">Small (Marginal/Small farmer)</SelectItem>
                <SelectItem value="Medium" className="text-base">Medium (Semi-medium farmer)</SelectItem>
                <SelectItem value="Large" className="text-base">Large (Medium/Large farmer)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="rounded-xl border border-secondary/20 bg-secondary/5 p-5">
            <p className="mb-4 text-sm sm:text-base font-medium text-foreground">💡 Annual Income & Expenses</p>
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block text-sm sm:text-base font-medium text-foreground">Annual Revenue (₹ thousands) *</Label>
                <Input 
                  type="number"
                  placeholder="e.g., 200 for ₹2,00,000" 
                  value={data.annualRevenue} 
                  onChange={e => update("annualRevenue", e.target.value)} 
                  className="h-11 sm:h-12 text-base"
                />
                <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
                  Total income from selling crops, milk, etc.
                </p>
              </div>
              
              <div>
                <Label className="mb-2 block text-sm sm:text-base font-medium text-foreground">Annual Expenses (₹ thousands) *</Label>
                <Input 
                  type="number"
                  placeholder="e.g., 120 for ₹1,20,000" 
                  value={data.annualExpenses} 
                  onChange={e => update("annualExpenses", e.target.value)} 
                  className="h-11 sm:h-12 text-base"
                />
                <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
                  Seeds, fertilizer, labour, fuel, etc.
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <Label className="mb-2 block text-sm sm:text-base font-medium text-foreground">Loan Amount Requested (₹ thousands) *</Label>
            <Input 
              type="number"
              placeholder="e.g., 50 for ₹50,000" 
              value={data.loanAmount} 
              onChange={e => update("loanAmount", e.target.value)} 
              className="h-11 sm:h-12 text-base"
            />
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
              How much loan are you looking for?
            </p>
          </div>
        </div>
      ),
    },
  ];

  const canProceed = () => {
    switch(step) {
      case 0:
        return data.farmerName && 
               data.email && 
               data.phoneNumber && 
               data.phoneNumber.length === 10 &&
               data.aadhaarNumber && 
               data.aadhaarNumber.length === 12 &&
               data.farmerId;
      case 1:
        return data.state && data.district && data.farmingSeason;
      case 2:
        return data.landholdingSize && data.cropType && data.irrigationType;
      case 3:
        return data.enterpriseSize && data.annualRevenue && data.annualExpenses && data.loanAmount;
      default:
        return true;
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Progress */}
      <div className="mb-6 lg:mb-8 flex items-center gap-2 sm:gap-3">
        {steps.map((s, i) => (
          <div key={i} className="flex flex-1 items-center gap-2 sm:gap-3">
            <div className={`flex h-9 w-9 sm:h-10 sm:w-10 lg:h-11 lg:w-11 shrink-0 items-center justify-center rounded-full text-sm sm:text-base font-bold transition-colors ${
              i < step ? "bg-kisan-leaf text-primary-foreground" :
              i === step ? "bg-gradient-gold text-primary-foreground" :
              "bg-muted text-muted-foreground"
            }`}>
              {i < step ? <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" /> : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 sm:h-1 flex-1 rounded ${i < step ? "bg-kisan-leaf" : "bg-muted"}`} />
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
          <div className="mb-5 lg:mb-6">
            <h2 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">{steps[step].title}</h2>
            <p className="mt-1 sm:mt-2 text-sm sm:text-base text-muted-foreground">{steps[step].subtitle}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 sm:p-6 lg:p-7 shadow-sm">
            {steps[step].content}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 lg:mt-7 flex justify-between gap-3">
        <Button
          variant="outline"
          onClick={() => setStep(s => s - 1)}
          disabled={step === 0}
          className="gap-2 px-4 sm:px-5 lg:px-6 py-4 sm:py-5 text-sm sm:text-base"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        {step < steps.length - 1 ? (
          <Button
            onClick={() => setStep(s => s + 1)}
            disabled={!canProceed()}
            className="gap-2 bg-gradient-gold px-4 sm:px-5 lg:px-6 py-4 sm:py-5 text-sm sm:text-base text-primary-foreground hover:opacity-90"
          >
            Next <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={() => onComplete(data)}
            disabled={!canProceed()}
            className="gap-2 bg-gradient-hero px-4 sm:px-5 lg:px-6 py-4 sm:py-5 text-sm sm:text-base text-primary-foreground hover:opacity-90"
          >
            Submit & Calculate Score 🌱
          </Button>
        )}
      </div>
    </div>
  );
};

export default OnboardingForm;
