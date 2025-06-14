
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Zap, Settings, Shield } from "lucide-react";
import { useAIConfig } from "@/hooks/useAIConfig";
import { ConfigHeader } from "./config/ConfigHeader";
import { AIProviderConfig } from "./config/AIProviderConfig";
import { ResponseConfig } from "./config/ResponseConfig";
import { FeatureToggles } from "./config/FeatureToggles";
import { LoadingState } from "./config/LoadingState";
import { AIFeaturesIndicator } from "./AIFeaturesIndicator";
import { SystemStatus } from "./SystemStatus";

export const AIConfigPanel = () => {
  const { config, loading, error, updateConfig, resetConfig, saveConfiguration, isSaving } = useAIConfig();

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <Card className="border-red-100">
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            <p>Error loading AI configuration: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <ConfigHeader onReset={resetConfig} onSave={saveConfiguration} isSaving={isSaving} />
      
      {/* System Status */}
      <SystemStatus />
      
      {/* AI Features Status */}
      <Card className="border-pink-100">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-pink-600" />
            <span>AI Features Status</span>
          </CardTitle>
          <CardDescription>
            Current status of AI capabilities and features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-sm">Personalized Responses</span>
              <Badge className="bg-green-100 text-green-700 border-green-200">Active</Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-sm">Industry-Specific Models</span>
              <Badge className="bg-green-100 text-green-700 border-green-200">Active</Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-sm">Performance Scoring</span>
              <Badge className="bg-green-100 text-green-700 border-green-200">Active</Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-sm">Real-time Coaching</span>
              <Badge className="bg-blue-100 text-blue-700 border-blue-200">Live</Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-sm">Multi-LLM Fallback</span>
              <Badge className="bg-green-100 text-green-700 border-green-200">Active</Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-sm">Context Memory</span>
              <Badge className="bg-green-100 text-green-700 border-green-200">Active</Badge>
            </div>
          </div>

          {/* Session-specific indicator */}
          <div className="mt-6">
            <AIFeaturesIndicator sessionActive={true} />
          </div>
        </CardContent>
      </Card>

      {/* Configuration Sections */}
      <div className="grid lg:grid-cols-2 gap-6">
        <AIProviderConfig config={config} onConfigChange={updateConfig} />
        <ResponseConfig config={config} onConfigChange={updateConfig} />
      </div>

      <FeatureToggles config={config} onConfigChange={updateConfig} />
    </div>
  );
};
