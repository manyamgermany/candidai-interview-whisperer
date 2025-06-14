
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";

interface SidebarProps {
  onNavigate: (tab: string) => void;
  onViewChange: (view: 'dashboard' | 'profile' | 'simulator' | 'reports' | 'config' | 'history') => void;
}

export const Sidebar = ({ onNavigate, onViewChange }: SidebarProps) => {
  return (
    <div className="space-y-6">
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
            <p className="font-medium text-pink-800 mb-1">Complete Your Profile</p>
            <p className="text-pink-700">Add your resume and projects for better AI suggestions.</p>
          </div>
          
          <div className="text-sm">
            <p className="font-medium text-pink-800 mb-1">Practice Regularly</p>
            <p className="text-pink-700">Use the simulator to improve your interview skills.</p>
          </div>
          
          <div className="text-sm">
            <p className="font-medium text-pink-800 mb-1">Review Performance</p>
            <p className="text-pink-700">Check reports to track your progress over time.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
