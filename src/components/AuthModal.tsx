import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Mail, Lock, User, ArrowRight, Sprout, CheckCircle2 } from "lucide-react";
import { authHelpers } from "@/lib/auth-helpers";
import { toast } from "sonner";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AuthModal = ({ open, onClose, onSuccess }: AuthModalProps) => {
  const [mode, setMode] = useState<"choice" | "login" | "register" | "verify">("choice");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    setError("");
    setSuccessMessage("");
    setMode("choice");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling
    setError("");
    setSuccessMessage("");
    setLoading(true);

    // Validation
    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }
    if (mode === "register" && !name) {
      setError("Please enter your name");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      if (mode === "register") {
        // Sign up new user
        const { user, error: signUpError } = await authHelpers.signUp(email, password, name);

        if (signUpError) {
          setError(signUpError.message);
          setLoading(false);
          return;
        }

        if (user) {
          // Show verification message
          setMode("verify");
          setSuccessMessage("Account created! Please check your email to verify your account.");
          toast.success("Verification email sent! Check your inbox.");
          setLoading(false);
          return;
        }
      } else if (mode === "login") {
        // Sign in existing user
        const { user, error: signInError } = await authHelpers.signIn(email, password);

        if (signInError) {
          setError(signInError.message);
          setLoading(false);
          return;
        }

        if (user) {
          // Check if email is verified
          const isVerified = await authHelpers.isEmailVerified();
          
          if (!isVerified) {
            setError("Please verify your email before logging in. Check your inbox.");
            setLoading(false);
            return;
          }

          toast.success("Welcome back!");
          setLoading(false);
          
          // Close modal first, then navigate
          handleClose();
          
          // Delay navigation to avoid race condition
          setTimeout(() => {
            onSuccess?.();
          }, 150);
        }
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err?.message || "An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setLoading(true);
    const { error } = await authHelpers.resendVerificationEmail(email);
    
    if (error) {
      toast.error("Failed to resend email. Please try again.");
    } else {
      toast.success("Verification email sent! Check your inbox.");
    }
    
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-elevated sm:p-8"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-hero">
                <Sprout className="h-7 w-7 text-primary-foreground" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground">
                {mode === "choice" ? "Welcome to KisanCred" : mode === "login" ? "Welcome Back" : "Join KisanCred"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {mode === "choice"
                  ? "Your farm is your credit score"
                  : mode === "login"
                  ? "Log in to access your dashboard"
                  : "Create your free account"}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {mode === "choice" ? (
                <motion.div
                  key="choice"
                  className="space-y-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Button
                    onClick={() => setMode("login")}
                    className="w-full gap-2 bg-gradient-hero text-primary-foreground hover:opacity-90"
                    size="lg"
                  >
                    <Mail className="h-4 w-4" /> Log In
                  </Button>
                  <Button
                    onClick={() => setMode("register")}
                    variant="outline"
                    className="w-full gap-2 border-primary/30 text-primary hover:bg-primary/5"
                    size="lg"
                  >
                    <User className="h-4 w-4" /> Create Account
                  </Button>
                  <p className="pt-2 text-center text-xs text-muted-foreground">
                    By continuing, you agree to our Terms of Service
                  </p>
                </motion.div>
              ) : mode === "verify" ? (
                <motion.div
                  key="verify"
                  className="space-y-4 text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <CheckCircle2 className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-foreground">Check Your Email</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      We've sent a verification link to <strong>{email}</strong>
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Click the link in the email to verify your account and start using KisanCred.
                    </p>
                  </div>
                  <div className="space-y-2 pt-2">
                    <Button
                      onClick={handleResendVerification}
                      disabled={loading}
                      variant="outline"
                      className="w-full"
                    >
                      {loading ? "Sending..." : "Resend Verification Email"}
                    </Button>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
                    >
                      Close
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  key={mode}
                  onSubmit={handleSubmit}
                  className="space-y-4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  {mode === "register" && (
                    <div>
                      <Label htmlFor="auth-name" className="text-foreground">Full Name</Label>
                      <div className="relative mt-1">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="auth-name"
                          placeholder="Ramesh Kumar"
                          value={name}
                          onChange={e => setName(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  )}
                  <div>
                    <Label htmlFor="auth-email" className="text-foreground">Email</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="auth-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="auth-password" className="text-foreground">Password</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="auth-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full gap-2 bg-gradient-gold text-accent-foreground hover:opacity-90"
                    size="lg"
                  >
                    {loading ? "Please wait..." : mode === "login" ? "Log In" : "Create Account"}
                    {!loading && <ArrowRight className="h-4 w-4" />}
                  </Button>

                  <button
                    type="button"
                    onClick={() => { setMode("choice"); setError(""); }}
                    className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
                  >
                    ← Back to options
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;