
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { PerformanceReports } from "@/components/dashboard/PerformanceReports";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { PerformanceReport } from "@/types/interviewTypes";

const ReportsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const latestReport = location.state?.latestReport as PerformanceReport | null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      <DashboardHeader onNavigate={(tab: string) => navigate(`/${tab}`)} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-pink-600 hover:text-pink-700 font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        <PerformanceReports latestReport={latestReport} />
      </div>
    </div>
  );
};

export default ReportsPage;
