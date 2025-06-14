
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Target, BarChart3, Settings, FileText, Play, Brain, History } from "lucide-react";

interface SidebarProps {
  onNavigate: (tab: string) => void;
  onViewChange: (view: 'dashboard' | 'profile' | 'simulator' | 'reports' | 'config' | 'history') => void;
}

export const Sidebar = ({ onNavigate, onViewChange }: SidebarProps) => {
  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card className="border-pink-100">
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <CardDescription>Access key features and tools</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={() => onViewChange('profile')}
            variant="outline"
            className="w-full justify-start border-pink-200 text-pink-700 hover:bg-pink-50"
          >
            <User className="h-4 w-4 mr-3" />
            Manage Profile
          </Button>
          
          <Button
            onClick={() => onViewChange('simulator')}
            variant="outline"
            className="w-full justify-start border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            <Play className="h-4 w-4 mr-3" />
            Interview Simulator
          </Button>
          
          <Button
            onClick={() => onViewChange('reports')}
            variant="outline"
            className="w-full justify-start border-green-200 text-green-700 hover:bg-green-50"
          >
            <BarChart3 className="h-4 w-4 mr-3" />
            Performance & History
          </Button>

          <Button
            onClick={() => onViewChange('config')}
            variant="outline"
            className="w-full justify-start border-indigo-200 text-indigo-700 hover:bg-indigo-50"
          >
            <Brain className="h-4 w-4 mr-3" />
            AI Configuration
          </Button>
          
          <Button
            onClick={() => onNavigate('settings')}
            variant="outline"
            className="w-full justify-start border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            <Settings className="h-4 w-4 mr-3" />
            Settings
          </Button>
        </CardContent>
      </Card>

      {/* AI Status Summary */}
      <Card className="border-pink-100">
        <CardHeader>
          <CardTitle className="text-lg">System Status</CardTitle>
          <CardDescription>Current system capabilities</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">AI Assistance</span>
            <Badge className="bg-green-100 text-green-700 border-green-200">Ready</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Speech Analysis</span>
            <Badge className="bg-green-100 text-green-700 border-green-200">Active</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Performance Tracking</span>
            <Badge className="bg-green-100 text-green-700 border-green-200">Active</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Real-time Coaching</span>
            <Badge className="bg-blue-100 text-blue-700 border-blue-200">Live</Badge>
          </div>
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
