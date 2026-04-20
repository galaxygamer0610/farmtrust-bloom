import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, CheckCircle2, Sprout, Eye, EyeOff } from "lucide-react";
import { authHelpers } from "@/lib/auth-helpers";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has a valid session (came from reset link)
    const checkSession = async () => {
      try {
        // Add a small delay to ensure URL params are loaded
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const { session, error } = await authHelpers.getSession();
        
        if (error) {
          console.error("Session error:", error);
          setIsValidSession(false);
          toast.error("Invalid or expired reset link");
          setTimeout(() => navigate("/forgot-password"), 2000);
          return;
        }
        
        if (session) {
          setIsValidSession(true);
        } else {
          setIsValidSession(false);
          toast.error("Invalid or expired reset link");
          setTimeout(() => navigate("/forgot-password"), 2000);
        }
      } catch (error) {
        console.error("Session check error:", error);
        setIsValidSession(false);
        toast.error("Error validating reset link");
        setTimeout(() => navigate("/forgot-password"), 2000);
      }
    };

    checkSession();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (!password || !confirmPassword) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const { error: updateError } = await authHelpers.updatePassword(password);

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
      toast.success("Password updated successfully!");
      setLoading(false);

      // Redirect to home after 2 seconds
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err: any) {
      console.error("Update password error:", err);
      setError(err?.message || "Failed to update password. Please try again.");
      setLoading(false);
    }
  };

  if (isValidSession === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (isValidSession === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-destructive">Invalid or expired reset link</p>
          <p className="mt-2 text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-hero">
              <Sprout className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              {success ? "Password Updated!" : "Set New Password"}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {success
                ? "You can now log in with your new password"
                : "Choose a strong password for your account"}
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-lg sm:p-8">
            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 text-center"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="text-foreground font-medium">
                    Your password has been successfully updated!
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Redirecting you to login...
                  </p>
                </div>
                <Button
                  onClick={() => navigate("/")}
                  className="w-full bg-gradient-hero text-primary-foreground hover:opacity-90"
                >
                  Go to Login
                </Button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="password" className="text-foreground">
                    New Password
                  </Label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 pl-11 pr-11 text-base"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Must be at least 6 characters
                  </p>
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-foreground">
                    Confirm New Password
                  </Label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-12 pl-11 pr-11 text-base"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-sm font-medium text-foreground mb-2">
                      Password Strength:
                    </p>
                    <div className="space-y-1 text-sm">
                      <div className={password.length >= 6 ? "text-primary" : "text-muted-foreground"}>
                        {password.length >= 6 ? "✓" : "○"} At least 6 characters
                      </div>
                      <div className={/[A-Z]/.test(password) ? "text-primary" : "text-muted-foreground"}>
                        {/[A-Z]/.test(password) ? "✓" : "○"} Contains uppercase letter (recommended)
                      </div>
                      <div className={/[0-9]/.test(password) ? "text-primary" : "text-muted-foreground"}>
                        {/[0-9]/.test(password) ? "✓" : "○"} Contains number (recommended)
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full gap-2 bg-gradient-gold text-accent-foreground hover:opacity-90"
                  size="lg"
                >
                  {loading ? "Updating..." : "Update Password"}
                  {!loading && <Lock className="h-4 w-4" />}
                </Button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPassword;
