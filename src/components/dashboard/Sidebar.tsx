
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileText, TrendingUp, Settings } from "lucide-react";

interface SidebarProps {
  onNavigate: (tab: string) => void;
}

export const Sidebar = ({ onNavigate }: SidebarProps) => {
  const aiProviders = [
    { name: "OpenAI GPT-4", status: "active", reliability: 98 },
    { name: "Anthropic Claude", status: "standby", reliability: 95 },
    { name: "Google Gemini", status: "standby", reliability: 92 }
  ];

  return (
    <div className="space-y-6">
      {/* AI Provider Status */}
      <Card className="border-pink-100">
        <CardHeader>
          <CardTitle className="text-lg">AI Provider Status</CardTitle>
          <CardDescription>
            Multi-LLM integration with intelligent fallback
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {aiProviders.map((provider, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    provider.status === 'active' ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  <span className="text-sm font-medium">{provider.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">{provider.reliability}%</div>
                  <Badge variant="secondary" className={`text-xs ${
                    provider.status === 'active' 
                      ? 'bg-green-100 text-green-700 border-green-200' 
                      : 'bg-gray-100 text-gray-700 border-gray-200'
                  }`}>
                    {provider.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-pink-100">
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start border-pink-200 text-pink-600 hover:bg-pink-50"
            onClick={() => onNavigate("documents")}
          >
            <FileText className="h-4 w-4 mr-2" />
            Upload Resume
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start border-pink-200 text-pink-600 hover:bg-pink-50"
            onClick={() => onNavigate("analytics")}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            View Analytics
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start border-pink-200 text-pink-600 hover:bg-pink-50"
            onClick={() => onNavigate("settings")}
          >
            <Settings className="h-4 w-4 mr-2" />
            Configure AI
          </Button>
        </CardContent>
      </Card>

      {/* Performance Overview */}
      <Card className="border-pink-100">
        <CardHeader>
          <CardTitle className="text-lg">Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Overall Score</span>
                <span className="font-medium">87%</span>
              </div>
              <Progress value={87} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Communication</span>
                <span className="font-medium">92%</span>
              </div>
              <Progress value={92} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Technical Skills</span>
                <span className="font-medium">85%</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Confidence</span>
                <span className="font-medium">89%</span>
              </div>
              <Progress value={89} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
