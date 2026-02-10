import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sprout, Shield, HandCoins, BarChart3, Users, Leaf } from "lucide-react";
import heroImage from "@/assets/hero-farm.jpg";

const features = [
  {
    icon: BarChart3,
    title: "Holistic Credit Score",
    description: "We look beyond bank statements—your soil, crops, and farming practices matter.",
  },
  {
    icon: Shield,
    title: "Trust, Not Just Numbers",
    description: "Your dedication to your land builds your creditworthiness.",
  },
  {
    icon: HandCoins,
    title: "Green Subsidies",
    description: "Earn rewards like solar pumps, seeds, and equipment through good practices.",
  },
  {
    icon: Sprout,
    title: "Growing Plant Score",
    description: "Watch your credit grow like a plant—from seed to full bloom.",
  },
  {
    icon: Users,
    title: "Community Support",
    description: "Connect with lenders who understand and respect farming communities.",
  },
  {
    icon: Leaf,
    title: "Sustainable Farming",
    description: "Organic and eco-friendly practices boost your score even higher.",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Indian farmer in golden sunlit field" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-kisan-soil/90 via-kisan-soil/70 to-transparent" />
        </div>
        <div className="container relative mx-auto px-4 py-24 md:py-36">
          <motion.div
            className="max-w-xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-kisan-gold/30 bg-kisan-gold/10 px-4 py-1.5 text-sm font-medium text-kisan-gold-light">
              <Sprout className="h-4 w-4" />
              Empowering India's Farmers
            </div>
            <h1 className="mb-4 font-display text-4xl font-extrabold leading-tight text-kisan-cream md:text-5xl lg:text-6xl">
              Your Farm is Your
              <span className="block text-gradient-gold">Credit Score</span>
            </h1>
            <p className="mb-8 text-lg text-kisan-cream/80">
              KisanTrust looks at the heart and soil of your farm—not just your bank account. 
              Build trust, earn subsidies, and access loans you deserve.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/onboarding">
                <Button size="lg" className="bg-gradient-gold text-primary-foreground text-base font-semibold hover:opacity-90 shadow-elevated">
                  Calculate Your Score 🌱
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="border-kisan-cream/30 text-kisan-cream hover:bg-kisan-cream/10 text-base">
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
            <h2 className="mb-2 font-display text-3xl font-bold text-foreground">How KisanTrust Works</h2>
            <p className="text-muted-foreground">Three simple steps to your holistic credit score</p>
          </motion.div>
          <div className="mx-auto grid max-w-3xl gap-8 md:grid-cols-3">
            {[
              { step: "1", emoji: "📝", title: "Share Your Story", desc: "Answer simple questions about your farm and finances" },
              { step: "2", emoji: "🌱", title: "Watch It Grow", desc: "See your score bloom from seed to sunflower" },
              { step: "3", emoji: "🎁", title: "Earn Rewards", desc: "Unlock loans, subsidies, and farming resources" },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-gold text-3xl shadow-card">
                  {item.emoji}
                </div>
                <h3 className="mb-1 font-display text-lg font-bold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="mb-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-2 font-display text-3xl font-bold text-foreground">Built on Trust</h2>
            <p className="text-muted-foreground">Features that put the farmer first</p>
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
            <Link to="/onboarding">
              <Button size="lg" className="bg-gradient-gold text-primary-foreground text-base font-semibold hover:opacity-90 shadow-elevated">
                Get Started Free 🌻
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container mx-auto flex flex-col items-center gap-2 px-4 text-center text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Sprout className="h-4 w-4 text-primary" />
            <span className="font-display font-bold text-foreground">KisanTrust</span>
          </div>
          <p>Empowering farmers through trust-based credit. © 2026</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
