import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { DashboardHome } from "@/components/dashboard/DashboardHome";
import { ExecutiveDashboard } from "@/components/dashboard/ExecutiveDashboard";
import { MarketingCloudDashboard } from "@/components/dashboard/MarketingCloudDashboard";
import { LinkedInDashboard } from "@/components/dashboard/LinkedInDashboard";
import { LinkedInAdsDashboard } from "@/components/dashboard/LinkedInAdsDashboard";
import { GoogleAdsDashboard } from "@/components/dashboard/GoogleAdsDashboard";
import { SEODashboard } from "@/components/dashboard/SEODashboard";
import { DirectMailDashboard } from "@/components/dashboard/DirectMailDashboard";
import { WebsiteTrafficDashboard } from "@/components/dashboard/WebsiteTrafficDashboard";
import { AcquisitionDashboard } from "@/components/dashboard/AcquisitionDashboard";
import { FinancialDashboard } from "@/components/dashboard/FinancialDashboard";
import { ThemeToggle } from "@/components/ThemeToggle";
import logoLight from "@/assets/logo-light.png";
import logoDark from "@/assets/logo-dark.png";

const Index = () => {
  const [activeSection, setActiveSection] = useState("home");
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleBack = () => setActiveSection("home");

  const renderDashboard = () => {
    switch (activeSection) {
      case "home":
        return <DashboardHome onNavigate={setActiveSection} />;
      case "executive":
        return <ExecutiveDashboard onBack={handleBack} />;
      case "marketing-cloud":
        return <MarketingCloudDashboard onBack={handleBack} />;
      case "linkedin":
        return <LinkedInDashboard onBack={handleBack} />;
      case "linkedin-ads":
        return <LinkedInAdsDashboard onBack={handleBack} />;
      case "google-ads":
        return <GoogleAdsDashboard onBack={handleBack} />;
      case "seo":
        return <SEODashboard onBack={handleBack} />;
      case "direct-mail":
        return <DirectMailDashboard onBack={handleBack} />;
      case "website-traffic":
        return <WebsiteTrafficDashboard onBack={handleBack} />;
      case "acquisition":
        return <AcquisitionDashboard onBack={handleBack} />;
      case "financial":
        return <FinancialDashboard onBack={handleBack} />;
      default:
        return <DashboardHome onNavigate={setActiveSection} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b border-border px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <button 
            onClick={() => setActiveSection("home")}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img 
              src={mounted && resolvedTheme === "dark" ? logoDark : logoLight} 
              alt="reLink Medical" 
              className="h-10 w-auto"
            />
          </button>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">Marketing Team</p>
              <p className="text-xs text-muted-foreground">Connected to 5 sources</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">MT</span>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="p-6 max-w-7xl mx-auto">
        {renderDashboard()}
      </main>
    </div>
  );
};

export default Index;
