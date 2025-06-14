
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, BarChart3, Settings, Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DashboardHeaderProps {
  onNavigate: (tab: string) => void;
}

export const DashboardHeader = ({ onNavigate }: DashboardHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-pink-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onNavigate("landing")}
              className="text-gray-600 hover:text-pink-600"
              aria-label="Go back to landing page"
            >
              <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
              Back
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">CandidAI Dashboard</h1>
              </div>
            </div>
          </div>
          <nav className="flex items-center space-x-3" role="navigation" aria-label="Dashboard navigation">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate("/profile")}
              className="border-pink-200 text-pink-600 hover:bg-pink-50"
              aria-label="Go to profile page"
            >
              <FileText className="h-4 w-4 mr-2" aria-hidden="true" />
              Profile
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate("/reports")}
              className="border-pink-200 text-pink-600 hover:bg-pink-50"
              aria-label="Go to analytics reports"
            >
              <BarChart3 className="h-4 w-4 mr-2" aria-hidden="true" />
              Analytics
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onNavigate("settings")}
              className="border-pink-200 text-pink-600 hover:bg-pink-50"
              aria-label="Go to settings page"
            >
              <Settings className="h-4 w-4 mr-2" aria-hidden="true" />
              Settings
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};
