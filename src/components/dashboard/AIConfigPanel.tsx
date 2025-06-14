import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Brain, Settings, Zap, Target, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { storageService } from "@/services/storageService";
import { AIConfig } from "@/types/storageTypes";

export const AIConfigPanel = () => {
  const [config, setConfig] = useState<AIConfig>({
    provider: 'fallback',
    model: 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 150,
    industryFocus: 'general',
    responseStyle: 'balanced',
    enablePersonalization: true,
    enableIndustryModels: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      setIsLoading(true);
      const settings = await storageService.getSettings();
      if (settings.aiConfig) {
        setConfig(settings.aiConfig);
      }
    } catch (error) {
      console.error('Failed to load AI configuration:', error);
      toast({
        title: "Configuration Error",
        description: "Failed to load AI configuration settings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfiguration = async () => {
    try {
      setIsSaving(true);
      await storageService.saveSettings({
        aiConfig: config
      });
      
      toast({
        title: "Configuration Saved",
        description: "AI configuration has been updated successfully.",
      });
    } catch (error) {
      console.error('Failed to save configuration:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save AI configuration.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading AI configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Configuration</h1>
          <p className="text-gray-600">Customize AI behavior and response patterns</p>
        </div>
        <Button onClick={saveConfiguration} disabled={isSaving} className="bg-pink-600 hover:bg-pink-700">
          {isSaving ? 'Saving...' : 'Save Configuration'}
        </Button>
      </div>

      {/* AI Provider Settings */}
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
            <Select value={config.provider} onValueChange={(value: any) => setConfig(prev => ({ ...prev, provider: value }))}>
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
            <Select value={config.model} onValueChange={(value) => setConfig(prev => ({ ...prev, model: value }))}>
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
              onValueChange={(value) => setConfig(prev => ({ ...prev, temperature: value[0] }))}
              max={1}
              min={0}
              step={0.1}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Response Configuration */}
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
            <Select value={config.responseStyle} onValueChange={(value: any) => setConfig(prev => ({ ...prev, responseStyle: value }))}>
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
            <Select value={config.industryFocus} onValueChange={(value) => setConfig(prev => ({ ...prev, industryFocus: value }))}>
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
              onValueChange={(value) => setConfig(prev => ({ ...prev, maxTokens: value[0] }))}
              max={500}
              min={50}
              step={25}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Feature Toggles */}
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
              onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enablePersonalization: checked }))}
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
              onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enableIndustryModels: checked }))}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
