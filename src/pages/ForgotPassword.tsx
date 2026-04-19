import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, CheckCircle2, Sprout } from "lucide-react";
import { authHelpers } from "@/lib/auth-helpers";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email) {
      setError("Please enter your email address");
      setLoading(false);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const { error: resetError } = await authHelpers.resetPassword(email);

      if (resetError) {
        setError(resetError.message);
        setLoading(false);
        return;
      }

      setSent(true);
      toast.success("Password reset email sent!");
      setLoading(false);
    } catch (err: any) {
      console.error("Reset password error:", err);
      setError(err?.message || "Failed to send reset email. Please try again.");
      setLoading(false);
    }
  };

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
              {sent ? "Check Your Email" : "Forgot Password?"}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {sent
                ? "We've sent you a password reset link"
                : "No worries, we'll send you reset instructions"}
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-lg sm:p-8">
            {sent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 text-center"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    We've sent a password reset link to
                  </p>
                  <p className="mt-1 font-medium text-foreground">{email}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4 text-left">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Next steps:</strong>
                  </p>
                  <ol className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <li>1. Check your email inbox</li>
                    <li>2. Click the reset password link</li>
                    <li>3. Enter your new password</li>
                    <li>4. Log in with your new password</li>
                  </ol>
                </div>
                <div className="space-y-3 pt-2">
                  <Button
                    onClick={() => navigate("/")}
                    className="w-full bg-gradient-hero text-primary-foreground hover:opacity-90"
                  >
                    Back to Home
                  </Button>
                  <button
                    onClick={() => setSent(false)}
                    className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
                  >
                    Didn't receive the email? Try again
                  </button>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="email" className="text-foreground">
                    Email Address
                  </Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 pl-11 text-base"
                      autoFocus
                    />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Enter the email address associated with your account
                  </p>
                </div>

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
                  {loading ? "Sending..." : "Send Reset Link"}
                  {!loading && <Mail className="h-4 w-4" />}
                </Button>

                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="flex w-full items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </button>
              </form>
            )}
          </div>

          {/* Help Text */}
          {!sent && (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Remember your password?{" "}
              <a
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/");
                }}
                className="font-medium text-primary hover:underline"
              >
                Log in
              </a>
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;
