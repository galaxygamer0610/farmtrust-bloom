import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sprout, Menu, X, LogIn, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import AuthModal from "./AuthModal";
import { authHelpers } from "@/lib/auth-helpers";
import { toast } from "sonner";

const Navbar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    checkAuth();
  }, [pathname]);

  const checkAuth = async () => {
    const { user } = await authHelpers.getCurrentUser();
    setIsAuthenticated(!!user);
    
    if (user) {
      // Get user name from metadata or email
      const name = user.user_metadata?.full_name || user.email?.split('@')[0] || "User";
      setUserName(name);
    }
  };

  const handleAuthSuccess = async () => {
    // Check authentication and onboarding status
    await checkAuth();
    
    const hasOnboarded = await authHelpers.hasCompletedOnboarding();
    
    if (hasOnboarded) {
      navigate("/dashboard");
    } else {
      navigate("/onboarding");
    }
  };

  const handleSignOut = async () => {
    const { error } = await authHelpers.signOut();
    
    if (error) {
      toast.error("Failed to sign out");
    } else {
      setIsAuthenticated(false);
      setUserName("");
      toast.success("Signed out successfully");
      navigate("/");
    }
  };

  const links = [
    { to: "/", label: "Home" },
    { to: "/dashboard", label: "Dashboard" },
    { to: "/subsidies", label: "Subsidies" },
  ];

  return (
    <>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onSuccess={handleAuthSuccess} />
      
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
            
            {/* Auth Button */}
            {isAuthenticated ? (
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="ml-2 gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            ) : (
              <Button
                onClick={() => setAuthOpen(true)}
                size="sm"
                className="ml-2 gap-2 bg-gradient-gold text-accent-foreground hover:opacity-90"
              >
                <LogIn className="h-4 w-4" />
                Login / Sign Up
              </Button>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="rounded-lg p-2 text-muted-foreground md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
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
            
            {/* Mobile Auth Button */}
            <div className="mt-2 pt-2 border-t border-border">
              {isAuthenticated ? (
                <Button
                  onClick={() => {
                    setMobileOpen(false);
                    handleSignOut();
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    setMobileOpen(false);
                    setAuthOpen(true);
                  }}
                  size="sm"
                  className="w-full gap-2 bg-gradient-gold text-accent-foreground hover:opacity-90"
                >
                  <LogIn className="h-4 w-4" />
                  Login / Sign Up
                </Button>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;