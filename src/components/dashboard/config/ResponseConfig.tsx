
import { memo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Zap } from "lucide-react";
import { AIConfig } from "@/types/storageTypes";

interface ResponseConfigProps {
  config: AIConfig;
  onConfigChange: (updates: Partial<AIConfig>) => void;
}

export const ResponseConfig = memo(({ config, onConfigChange }: ResponseConfigProps) => {
  return (
    <Card className="border-blue-100">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-blue-600" />
          <span>Response Settings</span>
        </CardTitle>
        <CardDescription>Customize how AI responds to your interviews</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="responseStyle">Response Style</Label>
          <Select 
            value={config.responseStyle} 
            onValueChange={(value: any) => onConfigChange({ responseStyle: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="concise">Concise</SelectItem>
              <SelectItem value="balanced">Balanced</SelectItem>
              <SelectItem value="detailed">Detailed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="industryFocus">Industry Focus</Label>
          <Select 
            value={config.industryFocus} 
            onValueChange={(value) => onConfigChange({ industryFocus: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="technology">Technology</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="consulting">Consulting</SelectItem>
              <SelectItem value="healthcare">Healthcare</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Max Response Length: {config.maxTokens} tokens</Label>
          <Slider
            value={[config.maxTokens]}
            onValueChange={(value) => onConfigChange({ maxTokens: value[0] })}
            max={500}
            min={50}
            step={25}
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
});

ResponseConfig.displayName = 'ResponseConfig';
