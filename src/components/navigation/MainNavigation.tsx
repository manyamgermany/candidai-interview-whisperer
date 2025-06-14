
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, BarChart3, Settings, Brain, History, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MainNavigationProps {
  onNavigate: (tab: string) => void;
}

export const MainNavigation = ({ onNavigate }: MainNavigationProps) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <Card className="border-pink-100">
        <CardHeader>
          <CardTitle className="text-lg">Navigation</CardTitle>
          <CardDescription>Access key features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            onClick={() => navigate("/profile")}
            variant="ghost"
            className="w-full justify-start text-pink-700 hover:bg-pink-50"
          >
            <User className="h-4 w-4 mr-2" />
            Profile Setup
          </Button>
          
          <Button
            onClick={() => navigate("/reports")}
            variant="ghost"
            className="w-full justify-start text-green-700 hover:bg-green-50"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Performance Reports
          </Button>

          <Button
            onClick={() => navigate("/config")}
            variant="ghost"
            className="w-full justify-start text-indigo-700 hover:bg-indigo-50"
          >
            <Brain className="h-4 w-4 mr-2" />
            AI Configuration
          </Button>

          <Button
            onClick={() => navigate("/history")}
            variant="ghost"
            className="w-full justify-start text-purple-700 hover:bg-purple-50"
          >
            <History className="h-4 w-4 mr-2" />
            Session History
          </Button>

          <Button
            onClick={() => onNavigate('settings')}
            variant="ghost"
            className="w-full justify-start text-gray-700 hover:bg-gray-50"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </CardContent>
      </Card>

      {/* Pro Tips */}
      <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-pink-100">
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Target className="h-5 w-5 text-pink-600" />
            <span>Pro Tips</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm">
            <p className="font-medium text-pink-800 mb-1">Stay Focused</p>
            <p className="text-pink-700">During sessions, minimize distractions and focus on the conversation.</p>
          </div>
          
          <div className="text-sm">
            <p className="font-medium text-pink-800 mb-1">Use AI Suggestions</p>
            <p className="text-pink-700">Pay attention to real-time AI coaching for better responses.</p>
          </div>
          
          <div className="text-sm">
            <p className="font-medium text-pink-800 mb-1">Review Performance</p>
            <p className="text-pink-700">Check reports after sessions to improve your skills.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
