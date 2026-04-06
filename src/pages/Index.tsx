import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sprout, Shield, HandCoins, BarChart3, Users, Leaf, Brain, FileText, MessageCircle, ChevronRight, Star } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import heroImage from "@/assets/hero-farm.jpg";

const features = [
  {
    icon: BarChart3,
    title: "AI Credit Score",
    description: "ML-powered scoring that considers soil, crops, finances, and climate—not just bank history.",
  },
  {
    icon: Shield,
    title: "Risk Assessment",
    description: "SHAP-based explainability shows exactly what factors affect your creditworthiness.",
  },
  {
    icon: HandCoins,
    title: "Subsidy Matching",
    description: "Auto-matched government schemes based on your profile—seeds, pumps, insurance & more.",
  },
  {
    icon: Brain,
    title: "AI Chat Assistant",
    description: "Ask questions about your score, loans, or subsidies in simple farmer-friendly language.",
  },
  {
    icon: FileText,
    title: "PDF Credit Report",
    description: "Download a professional credit report with score, risk factors, and improvement tips.",
  },
  {
    icon: Leaf,
    title: "Green Rewards",
    description: "Organic and sustainable practices boost your score and unlock premium subsidies.",
  },
];

const testimonials = [
  { name: "Ramesh Kumar", location: "Chandpur, UP", quote: "KisanCred helped me get my first loan in 24 hours. My farm was my proof!", rating: 5 },
  { name: "Sunita Devi", location: "Patna, Bihar", quote: "I never knew my soil quality could help me get better interest rates.", rating: 5 },
  { name: "Mohan Patel", location: "Rajkot, Gujarat", quote: "The subsidy matching found ₹15,000 in schemes I didn't even know existed.", rating: 5 },
];

const Index = () => {
  const [authOpen, setAuthOpen] = useState(false);
  const navigate = useNavigate();

  const handleCTA = () => {
    setAuthOpen(true);
  };

  const handleAuthSuccess = () => {
    navigate("/onboarding");
  };

  return (
    <div className="min-h-screen">
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onSuccess={handleAuthSuccess} />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Indian farmer in golden sunlit field" className="h-full w-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-r from-kisan-soil/90 via-kisan-soil/70 to-transparent" />
        </div>
        <div className="container relative mx-auto px-4 py-20 md:py-32 lg:py-40">
          <motion.div
            className="max-w-xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-sm font-medium text-kisan-gold-light">
              <Sprout className="h-4 w-4" />
              AI-Powered Credit Scoring for Farmers
            </div>
            <h1 className="mb-4 font-display text-4xl font-extrabold leading-tight text-kisan-cream md:text-5xl lg:text-6xl">
              Your Farm is Your
              <span className="block text-gradient-gold">Credit Score</span>
            </h1>
            <p className="mb-8 text-lg text-kisan-cream/80">
              KisanCred uses machine learning to assess your creditworthiness from soil quality, 
              crop health, and financial habits—not just bank statements.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                onClick={handleCTA}
                className="bg-gradient-gold text-accent-foreground text-base font-semibold hover:opacity-90 shadow-elevated"
              >
                Calculate Your Score 🌱
              </Button>
              <Link to="/dashboard">
                <Button size="lg" className="bg-gradient-gold text-accent-foreground text-base font-semibold hover:opacity-90 shadow-elevated">
                  View Demo Dashboard
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-card py-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="mb-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-2 font-display text-3xl font-bold text-foreground">How KisanCred Works</h2>
            <p className="text-muted-foreground">Three simple steps to your AI-powered credit score</p>
          </motion.div>
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
            {[
              { step: "1", emoji: "📝", title: "Share Your Story", desc: "Answer simple questions about your farm, finances, and region" },
              { step: "2", emoji: "🤖", title: "AI Analyzes", desc: "Our ML model calculates your score across 4 pillars" },
              { step: "3", emoji: "🎁", title: "Unlock Benefits", desc: "Get loans, subsidies, and personalized improvement tips" },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                className="relative text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-gold text-3xl shadow-card">
                  {item.emoji}
                </div>
                <h3 className="mb-1 font-display text-lg font-bold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
                {i < 2 && (
                  <ChevronRight className="absolute -right-4 top-8 hidden h-6 w-6 text-muted-foreground/40 md:block" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20" aria-labelledby="features-heading">
        <div className="container mx-auto px-4">
          <motion.div
            className="mb-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 id="features-heading" className="mb-2 font-display text-3xl font-bold text-foreground">Built for Farmers, Powered by AI</h2>
            <p className="text-muted-foreground">Features that put you first</p>
          </motion.div>
          <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                className="rounded-xl border border-border bg-card p-5 shadow-card transition-shadow hover:shadow-elevated"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-1 font-display text-lg font-bold text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-card py-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="mb-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-2 font-display text-3xl font-bold text-foreground">Trusted by Farmers</h2>
            <p className="text-muted-foreground">Real stories from real farmers</p>
          </motion.div>
          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                className="rounded-xl border border-border bg-background p-5 shadow-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="mb-3 flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="mb-3 text-sm text-foreground">"{t.quote}"</p>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.location}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-hero py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-3 font-display text-3xl font-bold text-primary-foreground">
              Every Farmer Deserves a Fair Chance
            </h2>
            <p className="mb-6 text-primary-foreground/80">
              Join thousands of farmers who've discovered their true credit potential.
            </p>
            <Button
              size="lg"
              onClick={handleCTA}
              className="bg-gradient-gold text-accent-foreground text-base font-semibold hover:opacity-90 shadow-elevated"
            >
              Get Started Free 🌻
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container mx-auto flex flex-col items-center gap-2 px-4 text-center text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Sprout className="h-4 w-4 text-primary" />
            <span className="font-display font-bold text-foreground">KisanCred</span>
          </div>
          <p>AI-powered credit scoring for Indian farmers. © 2026</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;