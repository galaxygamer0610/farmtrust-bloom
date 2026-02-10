import { Link, useLocation } from "react-router-dom";
import { Sprout } from "lucide-react";

const Navbar = () => {
  const { pathname } = useLocation();

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-hero">
            <Sprout className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-foreground">KisanTrust</span>
        </Link>
        <div className="flex items-center gap-1">
          {[
            { to: "/", label: "Home" },
            { to: "/onboarding", label: "Get Started" },
            { to: "/dashboard", label: "Dashboard" },
          ].map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                pathname === link.to
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
