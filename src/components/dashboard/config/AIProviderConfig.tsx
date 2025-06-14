
import { memo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Brain } from "lucide-react";
import { AIConfig } from "@/types/storageTypes";

interface AIProviderConfigProps {
  config: AIConfig;
  onConfigChange: (updates: Partial<AIConfig>) => void;
}

export const AIProviderConfig = memo(({ config, onConfigChange }: AIProviderConfigProps) => {
  return (
    <Card className="border-pink-100">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-pink-600" />
          <span>AI Provider</span>
        </CardTitle>
        <CardDescription>Configure which AI service to use</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="provider">Provider</Label>
          <Select 
            value={config.provider} 
            onValueChange={(value: any) => onConfigChange({ provider: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openai">OpenAI</SelectItem>
              <SelectItem value="anthropic">Anthropic</SelectItem>
              <SelectItem value="fallback">Fallback (Local)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="model">Model</Label>
          <Select 
            value={config.model} 
            onValueChange={(value) => onConfigChange({ model: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
              <SelectItem value="gpt-4">GPT-4</SelectItem>
              <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Temperature: {config.temperature}</Label>
          <Slider
            value={[config.temperature]}
            onValueChange={(value) => onConfigChange({ temperature: value[0] })}
            max={1}
            min={0}
            step={0.1}
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
});

AIProviderConfig.displayName = 'AIProviderConfig';
