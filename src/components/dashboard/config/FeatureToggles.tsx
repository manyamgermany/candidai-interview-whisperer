
import { memo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Target } from "lucide-react";
import { AIConfig } from "@/types/storageTypes";

interface FeatureTogglesProps {
  config: AIConfig;
  onConfigChange: (updates: Partial<AIConfig>) => void;
}

export const FeatureToggles = memo(({ config, onConfigChange }: FeatureTogglesProps) => {
  return (
    <Card className="border-green-100">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-green-600" />
          <span>Feature Settings</span>
        </CardTitle>
        <CardDescription>Enable or disable specific AI features</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="personalization">Personalized Responses</Label>
            <p className="text-sm text-gray-500">Use your profile for tailored suggestions</p>
          </div>
          <Switch
            id="personalization"
            checked={config.enablePersonalization}
            onCheckedChange={(checked) => onConfigChange({ enablePersonalization: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="industryModels">Industry-Specific Models</Label>
            <p className="text-sm text-gray-500">Use specialized models for your industry</p>
          </div>
          <Switch
            id="industryModels"
            checked={config.enableIndustryModels}
            onCheckedChange={(checked) => onConfigChange({ enableIndustryModels: checked })}
          />
        </div>
      </CardContent>
    </Card>
  );
});

FeatureToggles.displayName = 'FeatureToggles';
