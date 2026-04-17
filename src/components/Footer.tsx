import { Link } from "react-router-dom";
import { Sprout, Mail, MapPin, Phone, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
        {/* Main Footer Content */}
        <div className="grid gap-8 sm:gap-10 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* About Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-hero">
                <Sprout className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="font-display text-2xl font-bold text-foreground">KisanCred</span>
            </Link>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4 max-w-md">
              Empowering Indian farmers with AI-powered credit scoring. We believe your farm is your credit score—not just bank statements. 
              Get fair access to loans, subsidies, and financial opportunities based on your real agricultural potential.
            </p>
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display text-base sm:text-lg font-bold text-foreground mb-3 sm:mb-4">Quick Links</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/subsidies" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Subsidies
                </Link>
              </li>
              <li>
                <a href="#features" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  How It Works
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-display text-base sm:text-lg font-bold text-foreground mb-3 sm:mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">
                  Agricultural Innovation Hub<br />
                  New Delhi, India
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                <a href="mailto:support@kisancred.in" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  support@kisancred.in
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                <a href="tel:+911800123456" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  1800-123-456 (Toll Free)
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border mb-6"></div>

        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <Link to="/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link to="/faq" className="hover:text-primary transition-colors">
              FAQ
            </Link>
          </div>
          <p className="text-center sm:text-right">
            © {currentYear} KisanCred. All rights reserved.
          </p>
        </div>

        {/* Mission Statement */}
        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-xs sm:text-sm text-center text-muted-foreground italic">
            "Bridging the gap between traditional farming and modern finance through AI-powered credit assessment. 
            Every farmer deserves access to fair credit based on their true potential, not just paperwork."
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
