
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, Volume2, Bell, Eye, Zap, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { aiService } from "@/services/aiService";
import { useState, useEffect } from "react";

interface QuickSettingsSidebarProps {
  settings: any;
  onSettingsChange: (settings: any) => void;
}

export const QuickSettingsSidebar = ({ settings, onSettingsChange }: QuickSettingsSidebarProps) => {
  const { toast } = useToast();
  const [providerStatus, setProviderStatus] = useState<Record<string, boolean>>({});
  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    checkProviderStatus();
  }, [settings.aiProvider]);

  const checkProviderStatus = async () => {
    const providers = [
      { id: "openai", key: settings.aiProvider?.openaiKey },
      { id: "claude", key: settings.aiProvider?.claudeKey },
      { id: "gemini", key: settings.aiProvider?.geminiKey }
    ];

    const status: Record<string, boolean> = {};
    for (const provider of providers) {
      if (provider.key) {
        try {
          // Configure the provider in aiService
          await aiService.configure(provider.id, provider.key);
          status[provider.id] = await aiService.testProvider(provider.id);
        } catch (error) {
          status[provider.id] = false;
        }
      } else {
        status[provider.id] = false;
      }
    }
    setProviderStatus(status);
  };

  const updateSetting = (path: string[], value: any) => {
    const newSettings = { ...settings };
    let current = newSettings;
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) current[path[i]] = {};
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
    onSettingsChange(newSettings);

    // Show feedback for setting changes
    const settingName = path[path.length - 1];
    toast({
      title: "Setting Updated",
      description: `${settingName} has been ${value ? 'enabled' : 'disabled'}`,
    });
  };

  const handleOptimizeSettings = async () => {
    setIsOptimizing(true);
    
    try {
      // Simulate optimization process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Apply optimized settings
      const optimizedSettings = {
        ...settings,
        audio: {
          ...settings.audio,
          noiseReduction: true,
          autoGainControl: true,
          confidenceThreshold: 80
        },
        coaching: {
          ...settings.coaching,
          enableRealtime: true
        },
        ui: {
          ...settings.ui,
          visualIndicators: true
        }
      };
      
      onSettingsChange(optimizedSettings);
      
      toast({
        title: "Settings Optimized",
        description: "Your settings have been optimized for better performance.",
      });
    } catch (error) {
      toast({
        title: "Optimization Failed",
        description: "Failed to optimize settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const aiProviders = [
    { id: "openai", name: "OpenAI" },
    { id: "claude", name: "Claude" },
    { id: "gemini", name: "Gemini" }
  ];

  const hasValidConfiguration = Object.values(providerStatus).some(status => status === true);

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
              disabled={!hasValidConfiguration}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Volume2 className="h-4 w-4 text-pink-600" />
              <span className="text-sm font-medium">Audio Processing</span>
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
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg">API Status</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={checkProviderStatus}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {aiProviders.map((provider) => {
              const hasKey = settings.aiProvider?.[`${provider.id}Key`];
              const isPrimary = settings.aiProvider?.primary === provider.id;
              const isWorking = providerStatus[provider.id] === true;
              
              return (
                <div key={provider.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      hasKey && isWorking ? 'bg-green-500' : 
                      hasKey ? 'bg-yellow-500' : 'bg-gray-400'
                    }`}></div>
                    <span className="text-sm">{provider.name}</span>
                    {isPrimary && (
                      <Badge variant="secondary" className="bg-pink-100 text-pink-700 border-pink-200 text-xs">
                        Primary
                      </Badge>
                    )}
                  </div>
                  <Badge variant="secondary" className={`${
                    hasKey && isWorking ? 'bg-green-100 text-green-700 border-green-200' : 
                    hasKey ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                    'bg-gray-100 text-gray-700 border-gray-200'
                  } text-xs`}>
                    {hasKey && isWorking ? 'Active' : hasKey ? 'Configured' : 'No Key'}
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
          {hasValidConfiguration ? (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">System Ready</span>
              </div>
              <p className="text-xs text-green-700">
                All settings are properly configured and ready for use.
              </p>
            </div>
          ) : (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">Setup Required</span>
              </div>
              <p className="text-xs text-orange-700">
                Please configure at least one AI provider to enable coaching features.
              </p>
            </div>
          )}
          
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Active Providers:</span>
              <span className="font-medium">{Object.values(providerStatus).filter(Boolean).length}</span>
            </div>
            <div className="flex justify-between">
              <span>Real-time Coaching:</span>
              <span className={`font-medium ${
                settings.coaching?.enableRealtime && hasValidConfiguration ? 'text-green-600' : 'text-gray-400'
              }`}>
                {settings.coaching?.enableRealtime && hasValidConfiguration ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Audio Processing:</span>
              <span className={`font-medium ${
                settings.audio?.noiseReduction ? 'text-green-600' : 'text-gray-400'
              }`}>
                {settings.audio?.noiseReduction ? 'Active' : 'Inactive'}
              </span>
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
                <span className="font-medium">
                  {hasValidConfiguration ? 'Optimal' : 'Not Available'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${hasValidConfiguration ? 'bg-green-600' : 'bg-gray-400'}`} 
                  style={{width: hasValidConfiguration ? '85%' : '0%'}}
                ></div>
              </div>
            </div>
            
            <div className="text-sm">
              <div className="flex justify-between mb-1">
                <span>Configuration Score</span>
                <span className="font-medium">
                  {Math.round((Object.values(providerStatus).filter(Boolean).length / 3) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{width: `${(Object.values(providerStatus).filter(Boolean).length / 3) * 100}%`}}
                ></div>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full border-pink-200 text-pink-600 hover:bg-pink-50 text-sm"
              size="sm"
              onClick={handleOptimizeSettings}
              disabled={isOptimizing}
            >
              {isOptimizing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Optimizing...
                </>
              ) : (
                'Optimize Settings'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
