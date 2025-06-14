import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
interface SidebarProps {
  onViewChange: (view: 'dashboard' | 'profile' | 'simulator' | 'reports' | 'config' | 'history') => void;
}
export const Sidebar = ({
  onViewChange
}: SidebarProps) => {
  return <div className="space-y-6">
      {/* Minimal sidebar for focused dashboard */}
      <Card className="border-pink-100">
        
        <CardContent>
          <div className="text-sm text-gray-600">
            <p>Dashboard is optimized for distraction-free meetings and interviews.</p>
          </div>
        </CardContent>
      </Card>
    </div>;
};