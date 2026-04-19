import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Sun, Droplets, Sprout, Wrench, Shield, Landmark, CheckCircle2, ArrowRight, DollarSign, TrendingUp, Factory, Leaf, Beef, Zap, FlaskConical, ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Subsidy {
  name: string;
  category: string;
  description: string;
  benefit: string;
  link: string;
}

const allSchemes: Subsidy[] = [
  {
    name: "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
    category: "Income Support",
    description: "Provides direct income support to farmers.",
    benefit: "₹6000 per year transferred directly to bank accounts.",
    link: "https://pmkisan.gov.in/"
  },
  {
    name: "Pradhan Mantri Kisan Maandhan Yojana",
    category: "Income Support",
    description: "Pension scheme for small and marginal farmers.",
    benefit: "₹3000 monthly pension after age 60.",
    link: "https://maandhan.in/"
  },
  {
    name: "Pradhan Mantri Fasal Bima Yojana",
    category: "Insurance",
    description: "Crop insurance against natural disasters.",
    benefit: "Financial protection for crop loss.",
    link: "https://pmfby.gov.in/"
  },
  {
    name: "Weather-Based Crop Insurance Scheme",
    category: "Insurance",
    description: "Insurance based on weather conditions.",
    benefit: "Compensation for weather-related crop damage.",
    link: "https://pmfby.gov.in/"
  },
  {
    name: "Kisan Credit Card (KCC)",
    category: "Credit & Loan",
    description: "Provides short-term agricultural credit.",
    benefit: "Low-interest loans up to ₹3 lakh.",
    link: "https://www.nabard.org/"
  },
  {
    name: "Interest Subvention Scheme",
    category: "Credit & Loan",
    description: "Reduces interest burden on farm loans.",
    benefit: "Lower interest rates for farmers.",
    link: "https://www.nabard.org/"
  },
  {
    name: "Pradhan Mantri Krishi Sinchai Yojana",
    category: "Irrigation",
    description: "Improves irrigation and water efficiency.",
    benefit: "Subsidy on drip and sprinkler systems.",
    link: "https://pmksy.gov.in/"
  },
  {
    name: "PM-KUSUM Scheme",
    category: "Energy",
    description: "Promotes solar energy in agriculture.",
    benefit: "Subsidy on solar pumps and power systems.",
    link: "https://pmkusum.mnre.gov.in/"
  },
  {
    name: "Soil Health Card Scheme",
    category: "Soil & Fertilizer",
    description: "Provides soil testing and recommendations.",
    benefit: "Improves crop yield with proper nutrients.",
    link: "https://soilhealth.dac.gov.in/"
  },
  {
    name: "Fertilizer Subsidy",
    category: "Soil & Fertilizer",
    description: "Reduces cost of fertilizers.",
    benefit: "Affordable fertilizers for farmers.",
    link: "https://fert.nic.in/"
  },
  {
    name: "PM-AASHA",
    category: "Market Support",
    description: "Ensures fair price for crops.",
    benefit: "Farmers get Minimum Support Price (MSP).",
    link: "https://agriwelfare.gov.in/"
  },
  {
    name: "e-NAM",
    category: "Market Support",
    description: "Online agricultural trading platform.",
    benefit: "Better price discovery for crops.",
    link: "https://enam.gov.in/"
  },
  {
    name: "Agriculture Infrastructure Fund",
    category: "Infrastructure",
    description: "Supports agri infrastructure projects.",
    benefit: "Loans with interest subsidy.",
    link: "https://agriinfra.dac.gov.in/"
  },
  {
    name: "Gramin Bhandaran Yojana",
    category: "Infrastructure",
    description: "Supports rural storage infrastructure.",
    benefit: "Subsidy for warehouse construction.",
    link: "https://dmi.gov.in/"
  },
  {
    name: "Farm Mechanization Scheme",
    category: "Mechanization",
    description: "Promotes use of modern farm equipment.",
    benefit: "Subsidy on tractors and machinery.",
    link: "https://agrimachinery.nic.in/"
  },
  {
    name: "National Food Security Mission",
    category: "Crop Development",
    description: "Boosts production of key crops.",
    benefit: "Subsidy on seeds and inputs.",
    link: "https://nfsm.gov.in/"
  },
  {
    name: "Rashtriya Krishi Vikas Yojana",
    category: "Crop Development",
    description: "Promotes agricultural development.",
    benefit: "Funding for agri projects.",
    link: "https://rkvy.nic.in/"
  },
  {
    name: "Paramparagat Krishi Vikas Yojana",
    category: "Organic Farming",
    description: "Promotes organic farming.",
    benefit: "Financial support for organic practices.",
    link: "https://pgsindia-ncof.gov.in/"
  },
  {
    name: "Rashtriya Gokul Mission",
    category: "Livestock",
    description: "Improves livestock productivity.",
    benefit: "Support for cattle breeding.",
    link: "https://dahd.gov.in/"
  },
  {
    name: "National Livestock Mission",
    category: "Livestock",
    description: "Supports livestock-based livelihood.",
    benefit: "Subsidy for poultry, sheep, and goat farming.",
    link: "https://dahd.gov.in/"
  },
  {
    name: "National Beekeeping & Honey Mission",
    category: "Livestock",
    description: "Promotes beekeeping activities.",
    benefit: "Financial assistance for honey production.",
    link: "https://nbhm.gov.in/"
  }
];

const categories = [
  { value: "all", label: "All Schemes" },
  { value: "Income Support", label: "Income Support" },
  { value: "Insurance", label: "Insurance" },
  { value: "Credit & Loan", label: "Credit & Loan" },
  { value: "Irrigation", label: "Irrigation" },
  { value: "Energy", label: "Energy" },
  { value: "Soil & Fertilizer", label: "Soil & Fertilizer" },
  { value: "Market Support", label: "Market Support" },
  { value: "Infrastructure", label: "Infrastructure" },
  { value: "Mechanization", label: "Mechanization" },
  { value: "Crop Development", label: "Crop Development" },
  { value: "Organic Farming", label: "Organic Farming" },
  { value: "Livestock", label: "Livestock" },
];

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Income Support": return DollarSign;
    case "Insurance": return Shield;
    case "Credit & Loan": return Landmark;
    case "Irrigation": return Droplets;
    case "Energy": return Zap;
    case "Soil & Fertilizer": return FlaskConical;
    case "Market Support": return ShoppingCart;
    case "Infrastructure": return Factory;
    case "Mechanization": return Wrench;
    case "Crop Development": return Sprout;
    case "Organic Farming": return Leaf;
    case "Livestock": return Beef;
    default: return TrendingUp;
  }
};

const Subsidies = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = allSchemes.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                         s.description.toLowerCase().includes(search.toLowerCase()) ||
                         s.benefit.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "all" || s.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background py-6 sm:py-8 md:py-10">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          className="mb-6 sm:mb-8 md:mb-10 text-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">Government Subsidies & Schemes</h1>
          <p className="mt-2 text-sm sm:text-base md:text-lg text-muted-foreground">
            Discover {allSchemes.length} government schemes available for farmers
          </p>
        </motion.div>

        {/* Search & Filter */}
        <motion.div
          className="mb-5 sm:mb-6 md:mb-8 flex flex-col gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 sm:h-5 sm:w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search schemes by name, description, or benefit..."
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
                className="whitespace-nowrap px-3 sm:px-4 md:px-5 py-2 text-xs sm:text-sm"
              >
                {cat.label}
              </Button>
            ))}
          </div>
          {activeCategory !== "all" && (
            <p className="text-sm text-muted-foreground">
              Showing {filtered.length} scheme{filtered.length !== 1 ? 's' : ''} in {activeCategory}
            </p>
          )}
        </motion.div>

        {/* Schemes Grid */}
        <div className="grid gap-4 sm:gap-5 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((scheme, i) => {
            const Icon = getCategoryIcon(scheme.category);
            return (
              <motion.div
                key={scheme.name}
                className="rounded-xl border border-primary/20 bg-card p-4 sm:p-5 shadow-card transition-shadow hover:shadow-elevated"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="mb-3 sm:mb-4 flex items-start justify-between">
                  <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-lg bg-gradient-gold">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-accent-foreground" />
                  </div>
                  <span className="rounded-full bg-primary/10 px-2 sm:px-2.5 py-0.5 sm:py-1 text-xs font-medium text-primary">
                    {scheme.category}
                  </span>
                </div>
                <h3 className="mb-2 font-display text-base sm:text-lg font-bold text-foreground line-clamp-2">
                  {scheme.name}
                </h3>
                <p className="mb-3 text-sm text-muted-foreground line-clamp-2">{scheme.description}</p>
                <div className="mb-4 rounded-lg bg-primary/5 p-2.5">
                  <p className="text-xs font-medium text-muted-foreground">Benefit</p>
                  <p className="text-sm font-semibold text-primary">{scheme.benefit}</p>
                </div>
                <a
                  href={scheme.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-primary hover:underline"
                >
                  Learn More <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </a>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="py-10 sm:py-12 text-center">
            <p className="text-base text-muted-foreground mb-2">No schemes match your search.</p>
            <p className="text-sm text-muted-foreground">Try different keywords or select a different category.</p>
            <Button
              onClick={() => {
                setSearch("");
                setActiveCategory("all");
              }}
              variant="outline"
              className="mt-4"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Subsidies;