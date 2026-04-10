import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sprout, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import AuthModal from "@/components/AuthModal";

const Navbar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const handleAuthSuccess = () => {
    setAuthOpen(false);
    navigate("/onboarding"); // Or wherever you want to redirect after successful login/signup
  };

  const links = [
    { to: "/", label: "Home" },
    { to: "/dashboard", label: "Dashboard" },
    { to: "/subsidies", label: "Subsidies" },
  ];

  return (
    <>
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-hero">
            <Sprout className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-foreground">KisanCred</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map(link => (
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
          <Button
            variant="ghost"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
            onClick={() => setAuthOpen(true)}
          >
            Login
          </Button>
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <Button
            variant="ghost"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
            onClick={() => setAuthOpen(true)}
          >
            Login
          </Button>
          <button
            className="rounded-lg p-2 text-muted-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-background px-4 pb-4 md:hidden">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                pathname === link.to
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Button
            variant="ghost"
            className="block w-full justify-start px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground"
            onClick={() => {
              setAuthOpen(true);
              setMobileOpen(false);
            }}
          >
            Login
          </Button>
        </div>
      )}
    </nav>
    <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onSuccess={handleAuthSuccess} />
    </>
  );
};

export default Navbar;