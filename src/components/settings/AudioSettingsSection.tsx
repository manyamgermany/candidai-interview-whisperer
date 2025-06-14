
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Mic, Volume2, Settings as SettingsIcon } from "lucide-react";

interface AudioSettingsSectionProps {
  settings: any;
  onSettingsChange: (settings: any) => void;
}

export const AudioSettingsSection = ({ settings, onSettingsChange }: AudioSettingsSectionProps) => {
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

  const confidenceThreshold = settings.audio?.confidenceThreshold || 75;
  const fillerSensitivity = settings.audio?.fillerSensitivity || 3;

  return (
    <div className="space-y-6">
      <Card className="border-pink-100">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mic className="h-5 w-5 text-pink-600" />
            <span>Audio & Speech Analysis</span>
          </CardTitle>
          <CardDescription>
            Configure speech recognition and feedback settings for optimal performance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Confidence Threshold */}
          <div>
            <Label className="text-sm font-medium text-gray-900 mb-3 block">
              Confidence Threshold: {confidenceThreshold}%
            </Label>
            <div className="space-y-3">
              <Slider
                value={[confidenceThreshold]}
                onValueChange={(value) => updateSetting(['audio', 'confidenceThreshold'], value[0])}
                max={100}
                min={50}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>50% (More Sensitive)</span>
                <span>75% (Balanced)</span>
                <span>100% (Less Sensitive)</span>
              </div>
              <Progress value={confidenceThreshold} className="h-2" />
              <p className="text-xs text-gray-500">
                Minimum confidence level to trigger speech analysis feedback. Lower values catch more speech but may include false positives.
              </p>
            </div>
          </div>

          {/* Filler Word Sensitivity */}
          <div>
            <Label className="text-sm font-medium text-gray-900 mb-3 block">
              Filler Word Sensitivity: {['Very Low', 'Low', 'Medium', 'High', 'Very High'][fillerSensitivity - 1]}
            </Label>
            <div className="space-y-3">
              <Slider
                value={[fillerSensitivity]}
                onValueChange={(value) => updateSetting(['audio', 'fillerSensitivity'], value[0])}
                max={5}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Very Low</span>
                <span>Medium</span>
                <span>Very High</span>
              </div>
              <p className="text-xs text-gray-500">
                How strictly to detect and flag filler words (um, uh, like) during speech analysis.
              </p>
            </div>
          </div>

          {/* Audio Processing Options */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Audio Processing</h4>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h5 className="font-medium text-gray-900">Noise Reduction</h5>
                <p className="text-sm text-gray-500">Reduce background noise for better speech recognition</p>
              </div>
              <Switch 
                checked={settings.audio?.noiseReduction ?? false}
                onCheckedChange={(checked) => updateSetting(['audio', 'noiseReduction'], checked)}
              />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h5 className="font-medium text-gray-900">Auto Gain Control</h5>
                <p className="text-sm text-gray-500">Automatically adjust microphone sensitivity</p>
              </div>
              <Switch 
                checked={settings.audio?.autoGainControl ?? true}
                onCheckedChange={(checked) => updateSetting(['audio', 'autoGainControl'], checked)}
              />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h5 className="font-medium text-gray-900">Real-time Processing</h5>
                <p className="text-sm text-gray-500">Process speech in real-time for immediate feedback</p>
              </div>
              <Switch 
                checked={settings.coaching?.enableRealtime ?? true}
                onCheckedChange={(checked) => updateSetting(['coaching', 'enableRealtime'], checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
