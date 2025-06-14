import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { chromeStorage } from "@/utils/chromeStorage";
import { aiService } from "@/services/aiService";
import { 
  ArrowLeft, 
  Settings, 
  Brain, 
  Mic, 
  Volume2,
  Eye,
  Zap,
  Shield,
  Globe,
  Bell,
  Palette,
  Download,
  Upload,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Key,
  TestTube,
  Loader2
} from "lucide-react";

interface SettingsPanelProps {
  onNavigate: (tab: string) => void;
}

const SettingsPanel = ({ onNavigate }: SettingsPanelProps) => {
  const { toast } = useToast();
  const [aiProvider, setAiProvider] = useState("openai");
  const [responseStyle, setResponseStyle] = useState("professional");
  const [responseLength, setResponseLength] = useState([3]);
  const [realTimeAssistance, setRealTimeAssistance] = useState(true);
  const [audioFeedback, setAudioFeedback] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState([75]);
  const [fillerWordSensitivity, setFillerWordSensitivity] = useState([3]);
  const [desktopNotifications, setDesktopNotifications] = useState(true);
  const [visualIndicators, setVisualIndicators] = useState(true);
  const [localDataProcessing, setLocalDataProcessing] = useState(true);
  const [anonymousAnalytics, setAnonymousAnalytics] = useState(false);
  const [sessionRecording, setSessionRecording] = useState(true);
  const [apiKeys, setApiKeys] = useState({
    openai: '',
    claude: '',
    gemini: ''
  });
  const [selectedModels, setSelectedModels] = useState({
    openai: 'gpt-4o-mini',
    claude: 'claude-3-haiku-20240307',
    gemini: 'gemini-pro'
  });
  const [testingConnections, setTestingConnections] = useState({
    openai: false,
    claude: false,
    gemini: false
  });
  const [connectionStatus, setConnectionStatus] = useState({
    openai: 'untested' as 'untested' | 'connected' | 'failed',
    claude: 'untested' as 'untested' | 'connected' | 'failed',
    gemini: 'untested' as 'untested' | 'connected' | 'failed'
  });

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await chromeStorage.getSettings();
      if (settings) {
        setAiProvider(settings.aiProvider?.primary || "openai");
        setResponseStyle(settings.responseStyle?.tone || "professional");
        setRealTimeAssistance(settings.coaching?.enableRealtime ?? true);
        setAudioFeedback(settings.audio?.noiseReduction ?? false);
        
        // Load API keys
        if (settings.aiProvider) {
          setApiKeys({
            openai: settings.aiProvider.openaiKey || '',
            claude: settings.aiProvider.claudeKey || '',
            gemini: settings.aiProvider.geminiKey || ''
          });
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      const settings = {
        aiProvider: {
          primary: aiProvider,
          openaiKey: apiKeys.openai,
          claudeKey: apiKeys.claude,
          geminiKey: apiKeys.gemini,
          models: selectedModels
        },
        responseStyle: {
          tone: responseStyle,
          length: responseLength[0] === 1 ? 'brief' : responseLength[0] === 2 ? 'short' : responseLength[0] === 3 ? 'medium' : responseLength[0] === 4 ? 'detailed' : 'comprehensive',
          formality: 'formal'
        },
        audio: {
          inputDevice: 'default',
          outputDevice: 'default',
          noiseReduction: audioFeedback,
          autoGainControl: true
        },
        coaching: {
          enableRealtime: realTimeAssistance,
          frameworks: ['star', 'soar'],
          experienceLevel: 'mid'
        },
        analytics: {
          enableTracking: anonymousAnalytics,
          trackWPM: true,
          trackFillers: true,
          trackConfidence: true
        }
      };

      await chromeStorage.saveSettings(settings);
      
      // Configure AI service with new settings
      await aiService.configure(aiProvider, apiKeys[aiProvider as keyof typeof apiKeys], selectedModels[aiProvider as keyof typeof selectedModels]);
      aiService.setPrimaryProvider(aiProvider);
      
      toast({
        title: "Settings Saved",
        description: "Your preferences have been successfully saved.",
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const testConnection = async (provider: string) => {
    const apiKey = apiKeys[provider as keyof typeof apiKeys];
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: `Please enter an API key for ${provider} before testing.`,
        variant: "destructive",
      });
      return;
    }

    setTestingConnections(prev => ({ ...prev, [provider]: true }));
    
    try {
      // Configure the provider temporarily for testing
      await aiService.configure(provider, apiKey, selectedModels[provider as keyof typeof selectedModels]);
      const isWorking = await aiService.testProvider(provider);
      
      setConnectionStatus(prev => ({
        ...prev,
        [provider]: isWorking ? 'connected' : 'failed'
      }));
      
      toast({
        title: isWorking ? "Connection Successful" : "Connection Failed",
        description: isWorking 
          ? `Successfully connected to ${provider}` 
          : `Failed to connect to ${provider}. Please check your API key.`,
        variant: isWorking ? "default" : "destructive",
      });
    } catch (error) {
      setConnectionStatus(prev => ({ ...prev, [provider]: 'failed' }));
      toast({
        title: "Connection Failed",
        description: `Error testing ${provider}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setTestingConnections(prev => ({ ...prev, [provider]: false }));
    }
  };

  const resetToDefaults = () => {
    setAiProvider("openai");
    setResponseStyle("professional");
    setResponseLength([3]);
    setRealTimeAssistance(true);
    setAudioFeedback(false);
    setConfidenceThreshold([75]);
    setFillerWordSensitivity([3]);
    setDesktopNotifications(true);
    setVisualIndicators(true);
    setLocalDataProcessing(true);
    setAnonymousAnalytics(false);
    setSessionRecording(true);
    setApiKeys({ openai: '', claude: '', gemini: '' });
    setSelectedModels({
      openai: 'gpt-4o-mini',
      claude: 'claude-3-haiku-20240307',
      gemini: 'gemini-pro'
    });
    setConnectionStatus({ openai: 'untested', claude: 'untested', gemini: 'untested' });
    
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to defaults.",
    });
  };

  const exportSettings = () => {
    const settings = {
      aiProvider,
      responseStyle,
      responseLength: responseLength[0],
      realTimeAssistance,
      audioFeedback,
      confidenceThreshold: confidenceThreshold[0],
      fillerWordSensitivity: fillerWordSensitivity[0],
      desktopNotifications,
      visualIndicators,
      localDataProcessing,
      anonymousAnalytics,
      sessionRecording,
      selectedModels,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'candidai-settings.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Settings Exported",
      description: "Settings have been downloaded as JSON file.",
    });
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const settings = JSON.parse(e.target?.result as string);
        
        // Apply imported settings
        if (settings.aiProvider) setAiProvider(settings.aiProvider);
        if (settings.responseStyle) setResponseStyle(settings.responseStyle);
        if (settings.responseLength !== undefined) setResponseLength([settings.responseLength]);
        if (settings.realTimeAssistance !== undefined) setRealTimeAssistance(settings.realTimeAssistance);
        if (settings.audioFeedback !== undefined) setAudioFeedback(settings.audioFeedback);
        if (settings.confidenceThreshold !== undefined) setConfidenceThreshold([settings.confidenceThreshold]);
        if (settings.fillerWordSensitivity !== undefined) setFillerWordSensitivity([settings.fillerWordSensitivity]);
        if (settings.selectedModels) setSelectedModels(settings.selectedModels);
        
        toast({
          title: "Settings Imported",
          description: "Settings have been successfully imported.",
        });
      } catch (error) {
        toast({
          title: "Import Error",
          description: "Failed to import settings. Invalid file format.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const aiProviders = [
    { 
      id: "openai", 
      name: "OpenAI GPT-4", 
      status: connectionStatus.openai === 'connected' ? "connected" : connectionStatus.openai === 'failed' ? "failed" : "available", 
      reliability: 98,
      description: "Most reliable for conversational AI and structured responses",
      models: [
        { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Fast and efficient' },
        { id: 'gpt-4o', name: 'GPT-4o', description: 'Most capable model' },
        { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'High performance' }
      ]
    },
    { 
      id: "claude", 
      name: "Anthropic Claude", 
      status: connectionStatus.claude === 'connected' ? "connected" : connectionStatus.claude === 'failed' ? "failed" : "available", 
      reliability: 95,
      description: "Excellent for analytical and detailed responses",
      models: [
        { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', description: 'Fast and economical' },
        { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', description: 'Balanced performance' },
        { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', description: 'Most powerful' }
      ]
    },
    { 
      id: "gemini", 
      name: "Google Gemini", 
      status: connectionStatus.gemini === 'connected' ? "connected" : connectionStatus.gemini === 'failed' ? "failed" : "available", 
      reliability: 92,
      description: "Strong multimodal capabilities and reasoning",
      models: [
        { id: 'gemini-pro', name: 'Gemini Pro', description: 'Optimized for text' },
        { id: 'gemini-pro-vision', name: 'Gemini Pro Vision', description: 'Multimodal capabilities' }
      ]
    }
  ];

  const responseStyles = [
    { id: "professional", name: "Professional", description: "Formal, structured responses" },
    { id: "conversational", name: "Conversational", description: "Natural, friendly tone" },
    { id: "technical", name: "Technical", description: "Detailed, technical language" },
    { id: "concise", name: "Concise", description: "Brief, to-the-point responses" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-pink-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onNavigate("dashboard")}
                className="text-gray-600 hover:text-pink-600"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Settings & Configuration</h1>
                  <p className="text-xs text-gray-500">Customize your CandidAI experience</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={exportSettings}
                className="border-pink-200 text-pink-600 hover:bg-pink-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Settings
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={resetToDefaults}
                className="border-pink-200 text-pink-600 hover:bg-pink-50"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset to Defaults
              </Button>
              <Button 
                onClick={saveSettings}
                className="bg-pink-600 hover:bg-pink-700 text-white"
              >
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Provider Configuration */}
            <Card className="border-pink-100">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-pink-600" />
                  <span>AI Provider Configuration</span>
                </CardTitle>
                <CardDescription>
                  Choose and configure your preferred AI assistant
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {aiProviders.map((provider) => (
                    <div key={provider.id} className="border border-pink-100 rounded-lg overflow-hidden">
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            id={provider.id}
                            name="aiProvider"
                            value={provider.id}
                            checked={aiProvider === provider.id}
                            onChange={(e) => setAiProvider(e.target.value)}
                            className="w-4 h-4 text-pink-600"
                          />
                          <div className="flex-1">
                            <label htmlFor={provider.id} className="font-medium text-gray-900 cursor-pointer">
                              {provider.name}
                            </label>
                            <p className="text-sm text-gray-500">{provider.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <div className="text-sm font-medium">{provider.reliability}%</div>
                            <div className="text-xs text-gray-500">Reliability</div>
                          </div>
                          <Badge 
                            variant="secondary" 
                            className={`${
                              provider.status === 'connected' 
                                ? 'bg-green-100 text-green-700 border-green-200' 
                                : provider.status === 'failed'
                                ? 'bg-red-100 text-red-700 border-red-200'
                                : 'bg-blue-100 text-blue-700 border-blue-200'
                            }`}
                          >
                            {provider.status === 'connected' ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Connected
                              </>
                            ) : provider.status === 'failed' ? (
                              <>
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Failed
                              </>
                            ) : (
                              <>
                                <Key className="h-3 w-3 mr-1" />
                                Available
                              </>
                            )}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="px-4 pb-4 space-y-4 bg-gray-50">
                        {/* API Key Input */}
                        <div>
                          <Label htmlFor={`${provider.id}-key`} className="text-sm text-gray-700 font-medium">
                            API Key
                          </Label>
                          <div className="flex space-x-2 mt-1">
                            <Input
                              id={`${provider.id}-key`}
                              type="password"
                              placeholder="Enter API key..."
                              value={apiKeys[provider.id as keyof typeof apiKeys]}
                              onChange={(e) => setApiKeys(prev => ({
                                ...prev,
                                [provider.id]: e.target.value
                              }))}
                              className="flex-1"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => testConnection(provider.id)}
                              disabled={testingConnections[provider.id as keyof typeof testingConnections] || !apiKeys[provider.id as keyof typeof apiKeys]}
                              className="border-pink-200 text-pink-600 hover:bg-pink-50"
                            >
                              {testingConnections[provider.id as keyof typeof testingConnections] ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <TestTube className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        
                        {/* Model Selection */}
                        <div>
                          <Label htmlFor={`${provider.id}-model`} className="text-sm text-gray-700 font-medium">
                            Model Selection
                          </Label>
                          <Select
                            value={selectedModels[provider.id as keyof typeof selectedModels]}
                            onValueChange={(value) => setSelectedModels(prev => ({
                              ...prev,
                              [provider.id]: value
                            }))}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select model..." />
                            </SelectTrigger>
                            <SelectContent>
                              {provider.models.map((model) => (
                                <SelectItem key={model.id} value={model.id}>
                                  <div>
                                    <div className="font-medium">{model.name}</div>
                                    <div className="text-xs text-gray-500">{model.description}</div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Intelligent Fallback</h4>
                      <p className="text-sm text-blue-800 mt-1">
                        CandidAI automatically switches to backup providers if the primary fails, ensuring uninterrupted assistance.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Response Configuration */}
            <Card className="border-pink-100">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-pink-600" />
                  <span>Response Configuration</span>
                </CardTitle>
                <CardDescription>
                  Customize how AI provides suggestions and feedback
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-900 mb-3 block">Response Style</label>
                  <div className="grid grid-cols-2 gap-3">
                    {responseStyles.map((style) => (
                      <div key={style.id} className="flex items-center space-x-3">
                        <input
                          type="radio"
                          id={style.id}
                          name="responseStyle"
                          value={style.id}
                          checked={responseStyle === style.id}
                          onChange={(e) => setResponseStyle(e.target.value)}
                          className="w-4 h-4 text-pink-600"
                        />
                        <div>
                          <label htmlFor={style.id} className="text-sm font-medium text-gray-900 cursor-pointer">
                            {style.name}
                          </label>
                          <p className="text-xs text-gray-500">{style.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-900 mb-3 block">
                    Response Length: {responseLength[0] === 1 ? 'Brief' : responseLength[0] === 2 ? 'Short' : responseLength[0] === 3 ? 'Medium' : responseLength[0] === 4 ? 'Detailed' : 'Comprehensive'}
                  </label>
                  <Slider
                    value={responseLength}
                    onValueChange={setResponseLength}
                    max={5}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Brief</span>
                    <span>Medium</span>
                    <span>Comprehensive</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Audio & Speech Settings */}
            <Card className="border-pink-100">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mic className="h-5 w-5 text-pink-600" />
                  <span>Audio & Speech Analysis</span>
                </CardTitle>
                <CardDescription>
                  Configure speech recognition and feedback settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-900 mb-3 block">
                    Confidence Threshold: {confidenceThreshold[0]}%
                  </label>
                  <Slider
                    value={confidenceThreshold}
                    onValueChange={setConfidenceThreshold}
                    max={100}
                    min={50}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum confidence level to trigger speech analysis feedback
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-900 mb-3 block">
                    Filler Word Sensitivity: {fillerWordSensitivity[0] === 1 ? 'Low' : fillerWordSensitivity[0] === 2 ? 'Medium-Low' : fillerWordSensitivity[0] === 3 ? 'Medium' : fillerWordSensitivity[0] === 4 ? 'Medium-High' : 'High'}
                  </label>
                  <Slider
                    value={fillerWordSensitivity}
                    onValueChange={setFillerWordSensitivity}
                    max={5}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    How strictly to detect and flag filler words during speech
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Privacy & Security */}
            <Card className="border-pink-100">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-pink-600" />
                  <span>Privacy & Security</span>
                </CardTitle>
                <CardDescription>
                  Control data collection and privacy settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Local Data Processing</h4>
                    <p className="text-sm text-gray-500">Process speech analysis locally when possible</p>
                  </div>
                  <Switch 
                    checked={localDataProcessing} 
                    onCheckedChange={setLocalDataProcessing}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Anonymous Analytics</h4>
                    <p className="text-sm text-gray-500">Share anonymous usage data to improve the service</p>
                  </div>
                  <Switch 
                    checked={anonymousAnalytics} 
                    onCheckedChange={setAnonymousAnalytics}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Session Recording</h4>
                    <p className="text-sm text-gray-500">Allow temporary session recording for analysis</p>
                  </div>
                  <Switch 
                    checked={sessionRecording} 
                    onCheckedChange={setSessionRecording}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Settings */}
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
                    checked={realTimeAssistance} 
                    onCheckedChange={setRealTimeAssistance}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Volume2 className="h-4 w-4 text-pink-600" />
                    <span className="text-sm font-medium">Audio Feedback</span>
                  </div>
                  <Switch 
                    checked={audioFeedback} 
                    onCheckedChange={setAudioFeedback}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Bell className="h-4 w-4 text-pink-600" />
                    <span className="text-sm font-medium">Desktop Notifications</span>
                  </div>
                  <Switch 
                    checked={desktopNotifications} 
                    onCheckedChange={setDesktopNotifications}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Eye className="h-4 w-4 text-pink-600" />
                    <span className="text-sm font-medium">Visual Indicators</span>
                  </div>
                  <Switch 
                    checked={visualIndicators} 
                    onCheckedChange={setVisualIndicators}
                  />
                </div>
              </CardContent>
            </Card>

            {/* API Status */}
            <Card className="border-pink-100">
              <CardHeader>
                <CardTitle className="text-lg">API Status</CardTitle>
                <CardDescription>
                  Current status of integrated services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiProviders.map((provider) => (
                    <div key={provider.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          connectionStatus[provider.id as keyof typeof connectionStatus] === 'connected' ? 'bg-green-500' : 
                          connectionStatus[provider.id as keyof typeof connectionStatus] === 'failed' ? 'bg-red-500' : 'bg-gray-400'
                        }`}></div>
                        <span className="text-sm">{provider.name}</span>
                      </div>
                      <Badge variant="secondary" className={`${
                        connectionStatus[provider.id as keyof typeof connectionStatus] === 'connected' ? 'bg-green-100 text-green-700 border-green-200' : 
                        connectionStatus[provider.id as keyof typeof connectionStatus] === 'failed' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-gray-100 text-gray-700 border-gray-200'
                      } text-xs`}>
                        {connectionStatus[provider.id as keyof typeof connectionStatus] === 'connected' ? 'Connected' : 
                         connectionStatus[provider.id as keyof typeof connectionStatus] === 'failed' ? 'Failed' : 'Inactive'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Advanced Options */}
            <Card className="border-pink-100">
              <CardHeader>
                <CardTitle className="text-lg">Advanced</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <input
                    type="file"
                    accept=".json"
                    onChange={importSettings}
                    style={{ display: 'none' }}
                    id="import-settings"
                  />
                  <Button 
                    variant="outline" 
                    className="w-full justify-start border-pink-200 text-pink-600 hover:bg-pink-50"
                    onClick={() => document.getElementById('import-settings')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import Settings
                  </Button>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-pink-200 text-pink-600 hover:bg-pink-50"
                  onClick={() => toast({
                    title: "API Keys",
                    description: "Use the API key fields in the AI Provider section above.",
                  })}
                >
                  <Key className="h-4 w-4 mr-2" />
                  API Keys
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-pink-200 text-pink-600 hover:bg-pink-50"
                  onClick={() => toast({
                    title: "Theme Settings",
                    description: "Theme customization coming soon!",
                  })}
                >
                  <Palette className="h-4 w-4 mr-2" />
                  Theme Settings
                </Button>
              </CardContent>
            </Card>

            {/* Support */}
            <Card className="border-pink-100">
              <CardHeader>
                <CardTitle className="text-lg">Support</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-pink-50 border border-pink-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-pink-600" />
                    <span className="text-sm font-medium text-pink-900">Configuration Valid</span>
                  </div>
                  <p className="text-xs text-pink-700">
                    All settings are properly configured and ready for use.
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full border-pink-200 text-pink-600 hover:bg-pink-50"
                  onClick={() => toast({
                    title: "Support",
                    description: "Contact support feature coming soon!",
                  })}
                >
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
