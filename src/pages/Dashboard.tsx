import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import CreditScorePlant from "@/components/CreditScorePlant";
import ScoreBreakdown from "@/components/ScoreBreakdown";
import SubsidyRewards from "@/components/SubsidyRewards";
import HarvestMeter from "@/components/HarvestMeter";
import { TrendingUp, Percent, Clock, ArrowRight, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { authHelpers } from "@/lib/auth-helpers";
import { enhancedSupabaseHelpers } from "@/lib/supabase-enhanced-helpers";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface KisanData {
  name: string;
  village: string;
  farmSize: string;
  mainCrop: string;
  region: string;
  financialScore: number;
  agriculturalScore: number;
  resilienceScore: number;
  enablerScore: number;
  overallScore: number;
  loanAmount: string;
  regionCurve: number;
}

const defaultData: KisanData = {
  name: "Ramesh Kumar",
  village: "Chandpur",
  farmSize: "5",
  mainCrop: "Wheat",
  region: "fertile",
  financialScore: 72,
  agriculturalScore: 68,
  resilienceScore: 65,
  enablerScore: 60,
  overallScore: 70,
  loanAmount: "50000",
  regionCurve: 1.0,
};

const Dashboard = () => {
  const [data, setData] = useState<KisanData>(defaultData);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadUserData();
  }, [navigate]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      const { user } = await authHelpers.getCurrentUser();
      
      if (!user) {
        // Not authenticated - show demo data
        setIsAuthenticated(false);
        setLoading(false);
        toast.info("Viewing demo dashboard. Sign in to see your data.");
        return;
      }

      setIsAuthenticated(true);

      // Get farmer profile ID
      const farmerId = await authHelpers.getFarmerProfileId();
      
      if (!farmerId) {
        // User is authenticated but hasn't completed onboarding
        toast.info("Complete onboarding to see your personalized dashboard");
        setTimeout(() => navigate("/onboarding"), 2000);
        return;
      }

      // Fetch farmer profile directly
      const { data: farmerProfile, error: farmerError } = await supabase
        .from("farmers")
        .select("*")
        .eq("id", farmerId)
        .single();

      if (farmerError) {
        console.error("Error loading farmer profile:", farmerError);
        toast.error("Failed to load your profile");
        setLoading(false);
        return;
      }

      // Fetch financial data
      const { data: financialData, error: financialError } = await supabase
        .from("farmer_financial_data")
        .select("*")
        .eq("farmer_id", farmerId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (financialError) {
        console.error("Error loading financial data:", financialError);
      }

      // Fetch ML assessment if exists
      const { data: mlAssessment } = await supabase
        .from("ml_assessments")
        .select("*")
        .eq("farmer_id", farmerId)
        .order("assessment_date", { ascending: false })
        .limit(1)
        .single();

      // Calculate credit score (use ML assessment if available, otherwise calculate from financial data)
      let overallScore = 70; // Default
      
      if (mlAssessment?.predicted_credit_score) {
        overallScore = Math.round(mlAssessment.predicted_credit_score);
      } else if (financialData) {
        // Simple scoring algorithm based on financial health
        const revenue = financialData.annual_revenue || 0;
        const expenses = financialData.annual_expenses || 0;
        const loanAmount = financialData.loan_amount || 0;
        const netProfit = revenue - expenses;
        const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
        
        // Score components
        let score = 50; // Base score
        
        // Profit margin contribution (0-20 points)
        if (profitMargin > 30) score += 20;
        else if (profitMargin > 20) score += 15;
        else if (profitMargin > 10) score += 10;
        else if (profitMargin > 0) score += 5;
        
        // Revenue contribution (0-15 points)
        if (revenue > 500000) score += 15;
        else if (revenue > 300000) score += 10;
        else if (revenue > 100000) score += 5;
        
        // Debt ratio contribution (0-15 points)
        const debtRatio = revenue > 0 ? (loanAmount / revenue) : 1;
        if (debtRatio < 0.3) score += 15;
        else if (debtRatio < 0.5) score += 10;
        else if (debtRatio < 0.7) score += 5;
        
        overallScore = Math.min(100, Math.max(30, score));
      }

      // Calculate component scores from overall score
      const financialScore = Math.round(overallScore * 0.28); // 28% weight
      const agriculturalScore = Math.round(overallScore * 0.27); // 27% weight
      const resilienceScore = Math.round(overallScore * 0.25); // 25% weight
      const enablerScore = Math.round(overallScore * 0.20); // 20% weight

      // Extract crop type from array or string
      let cropType = "Unknown";
      if (farmerProfile.crop_types && Array.isArray(farmerProfile.crop_types) && farmerProfile.crop_types.length > 0) {
        cropType = farmerProfile.crop_types[0];
      } else if (financialData?.crop_type) {
        cropType = financialData.crop_type;
      }

      // Extract location info
      const farmLocation = farmerProfile.farm_location || "";
      const locationParts = farmLocation.split(",");
      const district = financialData?.district || locationParts[0]?.trim() || "Unknown";

      // Map database data to dashboard format
      const userData = {
        name: farmerProfile.full_name || "Farmer",
        village: district,
        farmSize: farmerProfile.farm_size_acres?.toString() || financialData?.landholding_size?.toString() || "0",
        mainCrop: cropType,
        region: financialData?.region || "Unknown",
        financialScore,
        agriculturalScore,
        resilienceScore,
        enablerScore,
        overallScore,
        loanAmount: financialData?.loan_amount?.toString() || "50000",
        regionCurve: 1.0,
      };

      setData(userData);
      toast.success(`Welcome back, ${userData.name}!`);
      setLoading(false);
    } catch (error: any) {
      console.error("Error loading user data:", error);
      toast.error(error?.message || "Failed to load your data");
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!dashboardRef.current) return;

    try {
      setIsDownloading(true);
      toast.info("Generating your report...");

      // Hide the download button temporarily
      const downloadButton = document.querySelector('[data-download-button]');
      if (downloadButton) {
        (downloadButton as HTMLElement).style.display = 'none';
      }

      // Wait a bit for the UI to update
      await new Promise(resolve => setTimeout(resolve, 100));

      // Capture the dashboard as canvas
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      // Show the button again
      if (downloadButton) {
        (downloadButton as HTMLElement).style.display = '';
      }

      // Calculate PDF dimensions
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: imgHeight > imgWidth ? 'portrait' : 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Add image to PDF
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

      // Add metadata
      pdf.setProperties({
        title: `FarmTrust Credit Report - ${data.name}`,
        subject: 'Farmer Credit Score Report',
        author: 'KisanCred',
        keywords: 'credit score, farmer, agriculture',
        creator: 'KisanCred Platform'
      });

      // Generate filename with date
      const date = new Date().toISOString().split('T')[0];
      const filename = `FarmTrust_Report_${data.name.replace(/\s+/g, '_')}_${date}.pdf`;

      // Download the PDF
      pdf.save(filename);

      toast.success("Report downloaded successfully!");
      setIsDownloading(false);
    } catch (error: any) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate report. Please try again.");
      setIsDownloading(false);
    }
  };

  const getInterestRate = (score: number) => {
    if (score >= 80) return 6.5;
    if (score >= 60) return 8.5;
    if (score >= 40) return 11;
    return 14;
  };

  const getApprovalTime = (score: number) => {
    if (score >= 80) return "24 hours";
    if (score >= 60) return "3 days";
    if (score >= 40) return "7 days";
    return "14 days";
  };

  const rate = getInterestRate(data.overallScore);
  const approvalTime = getApprovalTime(data.overallScore);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-6 sm:py-8 lg:py-10" ref={dashboardRef}>
      <div className="container mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header with Download Report */}
        <motion.div
          className="mb-6 sm:mb-8 flex items-start justify-between"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
              Namaste, {data.name} 🙏
            </h1>
            <p className="mt-1 sm:mt-2 text-sm sm:text-base lg:text-lg text-muted-foreground">
              {data.farmSize} acres in {data.village} · Growing {data.mainCrop}
            </p>
          </div>
          <Button
            onClick={handleDownloadReport}
            disabled={isDownloading}
            variant="default"
            size="sm"
            className="gap-2 bg-gradient-gold text-primary-foreground hover:opacity-90"
            data-download-button
          >
            <Download className="h-4 w-4" />
            {isDownloading ? "Generating..." : "Download Report"}
          </Button>
        </motion.div>

        {/* Top Row: Plant + Quick Stats */}
        <div className="mb-6 sm:mb-8 grid gap-5 sm:gap-6 lg:grid-cols-3">
          <motion.div
            className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-6 sm:p-7 shadow-card lg:col-span-1"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="mb-3 sm:mb-4 font-display text-base sm:text-lg lg:text-xl font-bold text-foreground">Your Trust Score</h2>
            <CreditScorePlant score={data.overallScore} />
          </motion.div>

          <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-3 lg:col-span-2">
            {[
              {
                icon: TrendingUp,
                label: "Credit Score",
                value: `${data.overallScore}/100`,
                sub: data.overallScore >= 60 ? "Eligible for loans ✅" : "Keep improving 💪",
                color: "bg-primary/10 text-primary",
              },
              {
                icon: Percent,
                label: "Interest Rate",
                value: `${rate}%`,
                sub: rate <= 8 ? "Best rate available 🌟" : "Improve score for lower rates",
                color: "bg-secondary/10 text-secondary",
              },
              {
                icon: Clock,
                label: "Approval Time",
                value: approvalTime,
                sub: data.overallScore >= 80 ? "Fast-track approval ⚡" : "Build trust for faster access",
                color: "bg-kisan-leaf/10 text-kisan-leaf",
              },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className="flex flex-col rounded-xl border border-border bg-card p-4 sm:p-5 shadow-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <div className={`mb-3 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-lg ${stat.color}`}>
                  <stat.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="font-display text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="mt-auto pt-2 text-xs sm:text-sm text-muted-foreground">{stat.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Harvest Meter */}
        <motion.div
          className="mb-6 sm:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <HarvestMeter
            score={data.overallScore}
            loanAmount={parseInt(data.loanAmount) || 50000}
          />
        </motion.div>

        {/* Score Breakdown */}
        <motion.div
          className="mb-6 sm:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <ScoreBreakdown
            financialScore={data.financialScore}
            agriculturalScore={data.agriculturalScore}
            resilienceScore={data.resilienceScore}
            enablerScore={data.enablerScore}
            regionCurve={data.regionCurve}
          />
        </motion.div>

        {/* Subsidy Rewards */}
        <motion.div
          className="mb-6 sm:mb-8 rounded-2xl border border-border bg-card p-5 sm:p-6 lg:p-7 shadow-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <SubsidyRewards score={data.overallScore} />
        </motion.div>

        {/* CTA */}
        {!isAuthenticated && (
          <motion.div
            className="rounded-2xl bg-gradient-hero p-6 sm:p-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <h3 className="mb-2 sm:mb-3 font-display text-xl sm:text-2xl font-bold text-primary-foreground">
              This is a demo. Calculate your real score!
            </h3>
            <p className="mb-4 sm:mb-5 text-sm sm:text-base text-primary-foreground/80">
              Sign up and enter your actual farm data for a personalized trust score.
            </p>
            <Link to="/">
              <Button className="bg-gradient-gold text-primary-foreground gap-2 px-6 sm:px-8 py-4 sm:py-5 text-sm sm:text-base hover:opacity-90">
                Get Started <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
