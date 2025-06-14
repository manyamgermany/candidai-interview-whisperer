
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Target, BarChart3, Settings, Play, Brain } from "lucide-react";

interface QuickActionsProps {
  onNavigate: (tab: string) => void;
  onViewChange: (view: 'dashboard' | 'profile' | 'simulator' | 'reports' | 'config' | 'history') => void;
}

export const QuickActions = ({ onNavigate, onViewChange }: QuickActionsProps) => {
  return (
    <Card className="border-pink-100">
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
        <CardDescription>Access key features and tools</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Button
          onClick={() => onViewChange('profile')}
          variant="outline"
          className="flex flex-col h-20 border-pink-200 text-pink-700 hover:bg-pink-50"
        >
          <User className="h-5 w-5 mb-2" />
          <span className="text-xs">Profile</span>
        </Button>
        
        <Button
          onClick={() => onViewChange('simulator')}
          variant="outline"
          className="flex flex-col h-20 border-blue-200 text-blue-700 hover:bg-blue-50"
        >
          <Play className="h-5 w-5 mb-2" />
          <span className="text-xs">Simulator</span>
        </Button>
        
        <Button
          onClick={() => onViewChange('reports')}
          variant="outline"
          className="flex flex-col h-20 border-green-200 text-green-700 hover:bg-green-50"
        >
          <BarChart3 className="h-5 w-5 mb-2" />
          <span className="text-xs">Reports</span>
        </Button>

        <Button
          onClick={() => onViewChange('config')}
          variant="outline"
          className="flex flex-col h-20 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
        >
          <Brain className="h-5 w-5 mb-2" />
          <span className="text-xs">AI Config</span>
        </Button>
        
        <Button
          onClick={() => onNavigate('settings')}
          variant="outline"
          className="flex flex-col h-20 border-gray-200 text-gray-700 hover:bg-gray-50"
        >
          <Settings className="h-5 w-5 mb-2" />
          <span className="text-xs">Settings</span>
        </Button>

        <Button
          onClick={() => onViewChange('history')}
          variant="outline"
          className="flex flex-col h-20 border-purple-200 text-purple-700 hover:bg-purple-50"
        >
          <Target className="h-5 w-5 mb-2" />
          <span className="text-xs">History</span>
        </Button>
      </CardContent>
    </Card>
  );
};
