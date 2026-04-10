import { Link } from "react-router-dom";
import { Sprout, Mail, Phone, MapPin, Twitter, Linkedin, Github, Youtube } from "lucide-react";
import { motion } from "framer-motion";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const productLinks = [
    { label: "Credit Score Calculator", to: "/onboarding" },
    { label: "Dashboard", to: "/dashboard" },
    { label: "Subsidies & Schemes", to: "/subsidies" },
    { label: "AI Chat Assistant", to: "/dashboard" },
  ];

  const companyLinks = [
    { label: "Home", to: "/" },
    { label: "About Us", to: "/" },
    { label: "How It Works", to: "/" },
    { label: "Success Stories", to: "/" },
  ];

  const supportLinks = [
    { label: "Help Center", to: "/" },
    { label: "Privacy Policy", to: "/" },
    { label: "Terms of Service", to: "/" },
    { label: "Contact Support", to: "/" },
  ];

  const socialLinks = [
    { icon: Twitter, label: "Twitter", href: "https://twitter.com" },
    { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com" },
    { icon: Youtube, label: "YouTube", href: "https://youtube.com" },
    { icon: Github, label: "GitHub", href: "https://github.com" },
  ];

  return (
    <footer className="border-t border-border bg-gradient-to-b from-card to-background">
      {/* Main footer grid */}
      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">

          {/* Brand Column */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-4"
          >
            <Link to="/" className="flex items-center gap-2 w-fit">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-hero shadow-card">
                <Sprout className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold text-foreground">KisanCred</span>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              AI-powered credit scoring for Indian farmers. Because your farm
              tells the story banks can't see.
            </p>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <a href="mailto:support@kisancred.in" className="flex items-center gap-2 hover:text-primary transition-colors">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                support@kisancred.in
              </a>
              <a href="tel:+918001234567" className="flex items-center gap-2 hover:text-primary transition-colors">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                +91 800 123 4567
              </a>
              <span className="flex items-start gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                Bengaluru, Karnataka, India
              </span>
            </div>
          </motion.div>

          {/* Product Links */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <h3 className="mb-4 font-display text-sm font-bold uppercase tracking-widest text-foreground">
              Product
            </h3>
            <ul className="flex flex-col gap-2.5">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary hover:translate-x-0.5 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Company Links */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <h3 className="mb-4 font-display text-sm font-bold uppercase tracking-widest text-foreground">
              Company
            </h3>
            <ul className="flex flex-col gap-2.5">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Support & Social */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <h3 className="mb-4 font-display text-sm font-bold uppercase tracking-widest text-foreground">
              Support
            </h3>
            <ul className="flex flex-col gap-2.5 mb-6">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            {/* Social Icons */}
            <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-widest text-foreground">
              Follow Us
            </h3>
            <div className="flex items-center gap-3">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border bg-card/60">
        <div className="container mx-auto flex flex-col items-center justify-between gap-3 px-4 py-4 text-xs text-muted-foreground sm:flex-row">
          <p>© {currentYear} KisanCred Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Made with ❤️ for Indian Farmers
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
