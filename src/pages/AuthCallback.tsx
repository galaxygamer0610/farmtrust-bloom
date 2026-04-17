// Auth Callback Page - Handles email verification redirects
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { authHelpers } from "@/lib/auth-helpers";
import { toast } from "sonner";

const AuthCallback = () => {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email...");
  const navigate = useNavigate();

  useEffect(() => {
    handleAuthCallback();
  }, []);

  const handleAuthCallback = async () => {
    try {
      // Get hash params from URL (Supabase uses hash-based routing for auth)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const type = hashParams.get('type');

      console.log('Auth callback - type:', type, 'has tokens:', !!accessToken);

      // If we have tokens in the URL, set the session
      if (accessToken && refreshToken) {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          console.error('Session error:', error);
          setStatus("error");
          setMessage("Email verification failed. Please try again.");
          toast.error("Verification failed");
          setTimeout(() => navigate("/"), 3000);
          return;
        }

        if (data.session) {
          // Check if user has completed onboarding
          const hasOnboarded = await authHelpers.hasCompletedOnboarding();

          setStatus("success");
          setMessage("Email verified successfully! Redirecting...");
          toast.success("Email verified!");

          // Redirect based on onboarding status
          setTimeout(() => {
            if (hasOnboarded) {
              navigate("/dashboard");
            } else {
              navigate("/onboarding");
            }
          }, 2000);
          return;
        }
      }

      // Fallback: Try to get existing session
      const { session, error } = await authHelpers.getSession();

      if (error) {
        console.error('Get session error:', error);
        setStatus("error");
        setMessage("Email verification failed. Please try again.");
        toast.error("Verification failed");
        setTimeout(() => navigate("/"), 3000);
        return;
      }

      if (session) {
        // Check if user has completed onboarding
        const hasOnboarded = await authHelpers.hasCompletedOnboarding();

        setStatus("success");
        setMessage("Email verified successfully! Redirecting...");
        toast.success("Email verified!");

        // Redirect based on onboarding status
        setTimeout(() => {
          if (hasOnboarded) {
            navigate("/dashboard");
          } else {
            navigate("/onboarding");
          }
        }, 2000);
      } else {
        setStatus("error");
        setMessage("No session found. Please try logging in again.");
        setTimeout(() => navigate("/"), 3000);
      }
    } catch (error) {
      console.error("Auth callback error:", error);
      setStatus("error");
      setMessage("An error occurred during verification.");
      setTimeout(() => navigate("/"), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        className="max-w-md w-full text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
          {status === "loading" && (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                Verifying Email
              </h2>
              <p className="text-muted-foreground">{message}</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                Email Verified!
              </h2>
              <p className="text-muted-foreground">{message}</p>
            </>
          )}

          {status === "error" && (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                Verification Failed
              </h2>
              <p className="text-muted-foreground">{message}</p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AuthCallback;
