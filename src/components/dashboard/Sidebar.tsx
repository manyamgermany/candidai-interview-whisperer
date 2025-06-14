
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SidebarProps {
  onViewChange: (view: 'dashboard' | 'profile' | 'simulator' | 'reports' | 'config' | 'history') => void;
}

export const Sidebar = ({
  onViewChange
}: SidebarProps) => {
  return (
    <div className="space-y-6">
      {/* Simple focused sidebar for meetings */}
      <Card className="border-pink-100">
        <CardHeader>
          <CardTitle className="text-lg">Session Focus</CardTitle>
          <CardDescription>Minimal distractions during meetings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Badge className="bg-green-100 text-green-700 border-green-200">
              Meeting Mode Active
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
