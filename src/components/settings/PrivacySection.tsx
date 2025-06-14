
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Shield, Lock, Eye, Database } from "lucide-react";

interface PrivacySectionProps {
  settings: any;
  onSettingsChange: (settings: any) => void;
}

export const PrivacySection = ({ settings, onSettingsChange }: PrivacySectionProps) => {
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

  return (
    <div className="space-y-6">
      <Card className="border-pink-100">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-pink-600" />
            <span>Privacy & Security</span>
          </CardTitle>
          <CardDescription>
            Control data collection, processing, and privacy settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start space-x-3">
              <Lock className="h-5 w-5 text-gray-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Local Data Processing</h4>
                <p className="text-sm text-gray-500">Process speech analysis locally when possible for enhanced privacy</p>
              </div>
            </div>
            <Switch 
              checked={settings.privacy?.localDataProcessing ?? true}
              onCheckedChange={(checked) => updateSetting(['privacy', 'localDataProcessing'], checked)}
            />
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start space-x-3">
              <Database className="h-5 w-5 text-gray-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Anonymous Analytics</h4>
                <p className="text-sm text-gray-500">Share anonymous usage data to improve the service</p>
              </div>
            </div>
            <Switch 
              checked={settings.analytics?.enableTracking ?? false}
              onCheckedChange={(checked) => updateSetting(['analytics', 'enableTracking'], checked)}
            />
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start space-x-3">
              <Eye className="h-5 w-5 text-gray-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Session Recording</h4>
                <p className="text-sm text-gray-500">Allow temporary session recording for analysis purposes</p>
              </div>
            </div>
            <Switch 
              checked={settings.privacy?.sessionRecording ?? true}
              onCheckedChange={(checked) => updateSetting(['privacy', 'sessionRecording'], checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
