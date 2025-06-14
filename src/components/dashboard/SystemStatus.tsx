
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const SystemStatus = () => {
  return (
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
  );
};
