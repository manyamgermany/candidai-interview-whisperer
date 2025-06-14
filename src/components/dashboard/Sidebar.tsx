import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
interface SidebarProps {
  onViewChange: (view: 'dashboard' | 'profile' | 'simulator' | 'reports' | 'config' | 'history') => void;
}
export const Sidebar = ({
  onViewChange
}: SidebarProps) => {
  return <div className="space-y-6">
      {/* Session Focus Card - Minimal and relevant */}
      <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-pink-100">
        
        
      </Card>
    </div>;
};