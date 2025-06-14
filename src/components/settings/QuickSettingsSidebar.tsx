
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, Volume2, Bell, Eye, Zap, CheckCircle, AlertCircle } from "lucide-react";

interface QuickSettingsSidebarProps {
  settings: any;
  onSettingsChange: (settings: any) => void;
}

export const QuickSettingsSidebar = ({ settings, onSettingsChange }: QuickSettingsSidebarProps) => {
  const updateSetting = (path: string[], value: any) => {
    const newSettings = { ...settings };
    let current = newSettings;
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) current[path[i]] = {};
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
    onSettingsChange(newSettings);
  };

  const aiProviders = [
    { id: "openai", name: "OpenAI" },
    { id: "claude", name: "Claude" },
    { id: "gemini", name: "Gemini" }
  ];

  return (
    <div className="space-y-6">
      {/* Quick Toggles */}
      <Card className="border-pink-100">
        <CardHeader>
          <CardTitle className="text-lg">Quick Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Brain className="h-4 w-4 text-pink-600" />
              <span className="text-sm font-medium">Real-time Assistance</span>
            </div>
            <Switch 
              checked={settings.coaching?.enableRealtime ?? true}
              onCheckedChange={(checked) => updateSetting(['coaching', 'enableRealtime'], checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Volume2 className="h-4 w-4 text-pink-600" />
              <span className="text-sm font-medium">Audio Feedback</span>
            </div>
            <Switch 
              checked={settings.audio?.noiseReduction ?? false}
              onCheckedChange={(checked) => updateSetting(['audio', 'noiseReduction'], checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="h-4 w-4 text-pink-600" />
              <span className="text-sm font-medium">Notifications</span>
            </div>
            <Switch 
              checked={settings.notifications?.desktop ?? true}
              onCheckedChange={(checked) => updateSetting(['notifications', 'desktop'], checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Eye className="h-4 w-4 text-pink-600" />
              <span className="text-sm font-medium">Visual Indicators</span>
            </div>
            <Switch 
              checked={settings.ui?.visualIndicators ?? true}
              onCheckedChange={(checked) => updateSetting(['ui', 'visualIndicators'], checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* API Status */}
      <Card className="border-pink-100">
        <CardHeader>
          <CardTitle className="text-lg">API Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {aiProviders.map((provider) => {
              const hasKey = settings.aiProvider?.[`${provider.id}Key`];
              const isPrimary = settings.aiProvider?.primary === provider.id;
              
              return (
                <div key={provider.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      hasKey ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                    <span className="text-sm">{provider.name}</span>
                    {isPrimary && (
                      <Badge variant="secondary" className="bg-pink-100 text-pink-700 border-pink-200 text-xs">
                        Primary
                      </Badge>
                    )}
                  </div>
                  <Badge variant="secondary" className={`${
                    hasKey ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'
                  } text-xs`}>
                    {hasKey ? 'Configured' : 'No Key'}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card className="border-pink-100">
        <CardHeader>
          <CardTitle className="text-lg">System Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">Configuration Valid</span>
            </div>
            <p className="text-xs text-green-700">
              All settings are properly configured and ready for use.
            </p>
          </div>
          
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Settings Version:</span>
              <span className="font-medium">2.1.0</span>
            </div>
            <div className="flex justify-between">
              <span>Last Updated:</span>
              <span className="font-medium">Just now</span>
            </div>
            <div className="flex justify-between">
              <span>Backup Status:</span>
              <span className="font-medium text-green-600">Enabled</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Optimization */}
      <Card className="border-pink-100">
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Zap className="h-4 w-4 text-pink-600" />
            <span>Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-sm">
              <div className="flex justify-between mb-1">
                <span>Response Speed</span>
                <span className="font-medium">Optimal</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{width: '85%'}}></div>
              </div>
            </div>
            
            <div className="text-sm">
              <div className="flex justify-between mb-1">
                <span>Accuracy</span>
                <span className="font-medium">95%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{width: '95%'}}></div>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full border-pink-200 text-pink-600 hover:bg-pink-50 text-sm"
              size="sm"
            >
              Optimize Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
