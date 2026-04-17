import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Sun, Droplets, Sprout, Wrench, Shield, Landmark, CheckCircle2, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const allSchemes = [
  {
    id: 1, title: "PM-KISAN", category: "income", icon: Landmark,
    benefit: "₹6,000/year direct transfer", eligibility: "All small/marginal farmers",
    description: "Income support of ₹6,000 per year in 3 equal installments to landholding farmer families.",
    minScore: 0,
  },
  {
    id: 2, title: "Pradhan Mantri Fasal Bima Yojana", category: "insurance", icon: Shield,
    benefit: "Crop insurance at 2% premium", eligibility: "Farmers growing notified crops",
    description: "Comprehensive crop insurance covering all stages of the crop cycle including post-harvest risks.",
    minScore: 20,
  },
  {
    id: 3, title: "Solar Pump Subsidy (KUSUM)", category: "equipment", icon: Sun,
    benefit: "Up to 60% subsidy on solar pumps", eligibility: "Score ≥ 50, land ownership proof",
    description: "Install solar-powered water pumps with government subsidy for sustainable irrigation.",
    minScore: 50,
  },
  {
    id: 4, title: "Premium Seeds Distribution", category: "input", icon: Sprout,
    benefit: "Free high-yield certified seeds", eligibility: "Score ≥ 30, small farms",
    description: "Access to disease-resistant, high-yield seed varieties through government distribution.",
    minScore: 30,
  },
  {
    id: 5, title: "Micro Irrigation Fund", category: "equipment", icon: Droplets,
    benefit: "Up to 55% subsidy on drip systems", eligibility: "Score ≥ 45, any farm size",
    description: "Install drip or sprinkler irrigation with significant government subsidy to save water.",
    minScore: 45,
  },
  {
    id: 6, title: "Farm Mechanization Grant", category: "equipment", icon: Wrench,
    benefit: "Up to ₹1,00,000 equipment grant", eligibility: "Score ≥ 70, demonstrated need",
    description: "Financial assistance for purchasing modern farming equipment and machinery.",
    minScore: 70,
  },
];

const categories = [
  { value: "all", label: "All Schemes" },
  { value: "income", label: "Income Support" },
  { value: "insurance", label: "Insurance" },
  { value: "equipment", label: "Equipment" },
  { value: "input", label: "Farm Inputs" },
];

const Subsidies = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const storedData = sessionStorage.getItem("kisanData");
  const userScore = storedData ? JSON.parse(storedData).overallScore : 0;

  const filtered = allSchemes.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase()) || 
                         s.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "all" || s.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background py-6 sm:py-8 md:py-10">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          className="mb-6 sm:mb-8 md:mb-10 text-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">Government Subsidies & Schemes</h1>
          <p className="mt-2 text-sm sm:text-base md:text-lg text-muted-foreground">
            {userScore > 0 
              ? `Your score: ${userScore}/100 — Eligible for ${filtered.filter(s => s.minScore <= userScore).length} schemes`
              : "Discover schemes you may be eligible for"}
          </p>
        </motion.div>

        {/* Search & Filter */}
        <motion.div
          className="mb-5 sm:mb-6 md:mb-8 flex flex-col gap-3 sm:flex-row"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 sm:h-5 sm:w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search schemes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-11 sm:h-12 pl-10 sm:pl-11 text-sm sm:text-base"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {categories.map(cat => (
              <Button
                key={cat.value}
                variant={activeCategory === cat.value ? "default" : "outline"}
                onClick={() => setActiveCategory(cat.value)}
                className="whitespace-nowrap px-3 sm:px-4 md:px-5 py-2 text-sm"
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Schemes Grid */}
        <div className="grid gap-4 sm:gap-5 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((scheme, i) => {
            const eligible = userScore >= scheme.minScore;
            return (
              <motion.div
                key={scheme.id}
                className={`rounded-xl border p-4 sm:p-5 transition-shadow ${
                  eligible
                    ? "border-primary/20 bg-card shadow-card hover:shadow-elevated"
                    : "border-border bg-muted/30 opacity-75"
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="mb-3 sm:mb-4 flex items-start justify-between">
                  <div className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-lg ${
                    eligible ? "bg-gradient-gold" : "bg-muted"
                  }`}>
                    <scheme.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${eligible ? "text-accent-foreground" : "text-muted-foreground"}`} />
                  </div>
                  {eligible && userScore > 0 && (
                    <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 sm:px-2.5 py-0.5 sm:py-1 text-xs font-medium text-primary">
                      <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Eligible
                    </span>
                  )}
                </div>
                <h3 className="mb-2 font-display text-base sm:text-lg md:text-xl font-bold text-foreground">{scheme.title}</h3>
                <p className="mb-3 text-sm text-muted-foreground">{scheme.description}</p>
                <div className="mb-3 rounded-lg bg-primary/5 p-2.5">
                  <p className="text-xs font-medium text-muted-foreground">Benefit</p>
                  <p className="text-sm font-semibold text-primary">{scheme.benefit}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs sm:text-sm text-muted-foreground">Min Score: {scheme.minScore}</p>
                  <Button variant="ghost" size="sm" className="gap-1 text-xs sm:text-sm text-primary">
                    Details <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="py-10 sm:py-12 text-center">
            <p className="text-sm text-muted-foreground">No schemes match your search. Try different keywords.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Subsidies;