
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Settings, Brain, Zap, Target, Volume2, MessageSquare } from "lucide-react";
import { chromeStorage } from "@/utils/chromeStorage";

interface AIConfig {
  personalizedSuggestions: boolean;
  realTimeCoaching: boolean;
  industrySpecific: boolean;
  responseFramework: 'star' | 'car' | 'soar' | 'par';
  suggestionFrequency: number; // 1-10 scale
  confidenceThreshold: number; // 0-100
  voiceFeedback: boolean;
  contextWindow: number; // words to consider for suggestions
}

export const AIConfigPanel = () => {
  const [config, setConfig] = useState<AIConfig>({
    personalizedSuggestions: true,
    realTimeCoaching: true,
    industrySpecific: true,
    responseFramework: 'star',
    suggestionFrequency: 5,
    confidenceThreshold: 70,
    voiceFeedback: false,
    contextWindow: 50
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const settings = await chromeStorage.getSettings();
      if (settings.aiConfig) {
        setConfig({ ...config, ...settings.aiConfig });
      }
    } catch (error) {
      console.error('Error loading AI config:', error);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      const settings = await chromeStorage.getSettings();
      await chromeStorage.saveSettings({
        ...settings,
        aiConfig: config
      });
    } catch (error) {
      console.error('Error saving AI config:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (key: keyof AIConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const resetToDefaults = () => {
    setConfig({
      personalizedSuggestions: true,
      realTimeCoaching: true,
      industrySpecific: true,
      responseFramework: 'star',
      suggestionFrequency: 5,
      confidenceThreshold: 70,
      voiceFeedback: false,
      contextWindow: 50
    });
  };

  return (
    <Card className="border-pink-100">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-pink-600" />
          <span>AI Configuration</span>
        </CardTitle>
        <CardDescription>
          Customize AI behavior and coaching preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Core Features */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Core Features</span>
          </h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <label className="text-sm font-medium">Personalized Suggestions</label>
                <p className="text-xs text-gray-500">Use your profile for tailored recommendations</p>
              </div>
              <Switch
                checked={config.personalizedSuggestions}
                onCheckedChange={(checked) => updateConfig('personalizedSuggestions', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <label className="text-sm font-medium">Real-time Coaching</label>
                <p className="text-xs text-gray-500">Live feedback during sessions</p>
              </div>
              <Switch
                checked={config.realTimeCoaching}
                onCheckedChange={(checked) => updateConfig('realTimeCoaching', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <label className="text-sm font-medium">Industry-Specific Models</label>
                <p className="text-xs text-gray-500">Use specialized AI for your industry</p>
              </div>
              <Switch
                checked={config.industrySpecific}
                onCheckedChange={(checked) => updateConfig('industrySpecific', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <label className="text-sm font-medium">Voice Feedback</label>
                <p className="text-xs text-gray-500">Audio alerts for coaching tips</p>
              </div>
              <Switch
                checked={config.voiceFeedback}
                onCheckedChange={(checked) => updateConfig('voiceFeedback', checked)}
              />
            </div>
          </div>
        </div>

        {/* Response Framework */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span>Response Framework</span>
          </h4>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Preferred Framework</label>
            <Select
              value={config.responseFramework}
              onValueChange={(value) => updateConfig('responseFramework', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="star">STAR (Situation, Task, Action, Result)</SelectItem>
                <SelectItem value="car">CAR (Challenge, Action, Result)</SelectItem>
                <SelectItem value="soar">SOAR (Situation, Objective, Action, Result)</SelectItem>
                <SelectItem value="par">PAR (Problem, Action, Result)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* AI Sensitivity Settings */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>AI Sensitivity</span>
          </h4>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Suggestion Frequency</label>
                <Badge variant="outline">{config.suggestionFrequency}/10</Badge>
              </div>
              <Slider
                value={[config.suggestionFrequency]}
                onValueChange={(value) => updateConfig('suggestionFrequency', value[0])}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                How often AI provides suggestions (1 = rarely, 10 = very frequently)
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Confidence Threshold</label>
                <Badge variant="outline">{config.confidenceThreshold}%</Badge>
              </div>
              <Slider
                value={[config.confidenceThreshold]}
                onValueChange={(value) => updateConfig('confidenceThreshold', value[0])}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Minimum confidence level for AI suggestions
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Context Window</label>
                <Badge variant="outline">{config.contextWindow} words</Badge>
              </div>
              <Slider
                value={[config.contextWindow]}
                onValueChange={(value) => updateConfig('contextWindow', value[0])}
                max={100}
                min={20}
                step={10}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Number of recent words AI considers for suggestions
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <Button
            onClick={saveConfig}
            disabled={saving}
            className="bg-pink-600 hover:bg-pink-700 text-white"
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </Button>
          <Button
            onClick={resetToDefaults}
            variant="outline"
          >
            Reset to Defaults
          </Button>
        </div>

        {/* Configuration Preview */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h5 className="font-medium text-blue-900 mb-2">Current Configuration</h5>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span>Personalized:</span>
              <span className={config.personalizedSuggestions ? 'text-green-600' : 'text-gray-500'}>
                {config.personalizedSuggestions ? 'On' : 'Off'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Live Coaching:</span>
              <span className={config.realTimeCoaching ? 'text-green-600' : 'text-gray-500'}>
                {config.realTimeCoaching ? 'On' : 'Off'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Framework:</span>
              <span className="uppercase">{config.responseFramework}</span>
            </div>
            <div className="flex justify-between">
              <span>Frequency:</span>
              <span>{config.suggestionFrequency}/10</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
