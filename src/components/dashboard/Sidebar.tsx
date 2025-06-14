
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SidebarProps {
  onViewChange: (view: 'dashboard' | 'profile' | 'simulator' | 'reports' | 'config' | 'history') => void;
}

export const Sidebar = ({ onViewChange }: SidebarProps) => {
  return (
    <div className="space-y-6">
      {/* Session Focus Card - Minimal and relevant */}
      <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-pink-100">
        <CardHeader>
          <CardTitle className="text-lg text-pink-800">Session Focus</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm">
            <p className="font-medium text-pink-800 mb-1">Stay Present</p>
            <p className="text-pink-700">Focus on the conversation and let AI assist you.</p>
          </div>
          
          <div className="text-sm">
            <p className="font-medium text-pink-800 mb-1">Monitor Metrics</p>
            <p className="text-pink-700">Keep an eye on your speaking pace and confidence.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
