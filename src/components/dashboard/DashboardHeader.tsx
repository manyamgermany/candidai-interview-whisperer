
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, BarChart3, Settings, Brain } from "lucide-react";

interface DashboardHeaderProps {
  onNavigate: (tab: string) => void;
}

export const DashboardHeader = ({ onNavigate }: DashboardHeaderProps) => {
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
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">CandidAI Dashboard</h1>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onNavigate("documents")}
              className="border-pink-200 text-pink-600 hover:bg-pink-50"
            >
              <FileText className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onNavigate("analytics")}
              className="border-pink-200 text-pink-600 hover:bg-pink-50"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onNavigate("settings")}
              className="border-pink-200 text-pink-600 hover:bg-pink-50"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
