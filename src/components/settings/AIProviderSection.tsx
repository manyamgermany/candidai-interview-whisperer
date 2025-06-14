
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { aiService } from "@/services/aiService";
import { 
  Brain, 
  CheckCircle, 
  AlertCircle, 
  Key, 
  TestTube, 
  Loader2,
  Clock,
  DollarSign,
  Zap,
  RefreshCw,
  Eye,
  EyeOff,
  Star,
  Wifi,
  WifiOff
} from "lucide-react";

interface AIProviderSectionProps {
  settings: any;
  onSettingsChange: (settings: any) => void;
  searchQuery: string;
}

export const AIProviderSection = ({ settings, onSettingsChange, searchQuery }: AIProviderSectionProps) => {
  const { toast } = useToast();
  const [testingConnections, setTestingConnections] = useState<Record<string, boolean>>({});
  const [connectionStatus, setConnectionStatus] = useState<Record<string, 'untested' | 'connected' | 'failed' | 'testing'>>({
    openai: 'untested',
    claude: 'untested', 
    gemini: 'untested'
  });
  const [testProgress, setTestProgress] = useState<Record<string, number>>({});
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [testErrors, setTestErrors] = useState<Record<string, string>>({});

  const aiProviders = [
    { 
      id: "openai", 
      name: "OpenAI", 
      description: "Most reliable for conversational AI and structured responses",
      icon: "🤖",
      reliability: 98,
      avgResponseTime: "1.2s",
      costRating: 3,
      models: [
        { 
          id: 'gpt-4o-mini', 
          name: 'GPT-4o Mini', 
          description: 'Fast and efficient - $0.15/1M tokens',
          speed: 95,
          cost: 1,
          capability: 85,
          recommended: true
        },
        { 
          id: 'gpt-4o', 
          name: 'GPT-4o', 
          description: 'Most capable model - $2.50/1M tokens',
          speed: 80,
          cost: 4,
          capability: 98
        },
        { 
          id: 'gpt-4-turbo', 
          name: 'GPT-4 Turbo', 
          description: 'High performance - $10.00/1M tokens',
          speed: 75,
          cost: 5,
          capability: 95
        }
      ]
    },
    { 
      id: "claude", 
      name: "Anthropic Claude", 
      description: "Excellent for analytical and detailed responses",
      icon: "🧠",
      reliability: 95,
      avgResponseTime: "1.8s",
      costRating: 4,
      models: [
        { 
          id: 'claude-3-haiku-20240307', 
          name: 'Claude 3 Haiku', 
          description: 'Fast and economical - $0.25/1M tokens',
          speed: 90,
          cost: 1,
          capability: 80
        },
        { 
          id: 'claude-3-sonnet-20240229', 
          name: 'Claude 3 Sonnet', 
          description: 'Balanced performance - $3.00/1M tokens',
          speed: 75,
          cost: 3,
          capability: 90,
          recommended: true
        },
        { 
          id: 'claude-3-opus-20240229', 
          name: 'Claude 3 Opus', 
          description: 'Most powerful - $15.00/1M tokens',
          speed: 60,
          cost: 5,
          capability: 95
        }
      ]
    },
    { 
      id: "gemini", 
      name: "Google Gemini", 
      description: "Strong multimodal capabilities and reasoning",
      icon: "✨",
      reliability: 92,
      avgResponseTime: "2.1s",
      costRating: 2,
      models: [
        { 
          id: 'gemini-pro', 
          name: 'Gemini Pro', 
          description: 'Optimized for text - $0.50/1M tokens',
          speed: 85,
          cost: 2,
          capability: 88,
          recommended: true
        },
        { 
          id: 'gemini-pro-vision', 
          name: 'Gemini Pro Vision', 
          description: 'Multimodal capabilities - $0.50/1M tokens',
          speed: 80,
          cost: 2,
          capability: 90
        }
      ]
    }
  ];

  const validateApiKey = (provider: string, key: string) => {
    if (!key.trim()) {
      return "API key is required";
    }

    switch (provider) {
      case 'openai':
        if (!key.startsWith('sk-')) {
          return "OpenAI API keys must start with 'sk-'";
        } 
        if (key.length < 45) {
          return "OpenAI API key is too short (should be ~51 characters)";
        }
        if (key.length > 60) {
          return "OpenAI API key is too long";
        }
        break;
      case 'claude':
        if (!key.startsWith('sk-ant-')) {
          return "Claude API keys must start with 'sk-ant-'";
        }
        if (key.length < 40) {
          return "Claude API key appears to be too short";
        }
        break;
      case 'gemini':
        if (key.length < 35) {
          return "Gemini API key appears to be too short";
        }
        if (!/^[A-Za-z0-9_-]+$/.test(key)) {
          return "Gemini API key contains invalid characters";
        }
        break;
    }
    
    return null;
  };

  const updateApiKey = (provider: string, key: string) => {
    const newSettings = {
      ...settings,
      aiProvider: {
        ...settings.aiProvider,
        [`${provider}Key`]: key
      }
    };
    
    // Real-time validation
    const error = validateApiKey(provider, key);
    setValidationErrors(prev => {
      const updated = { ...prev };
      if (error) {
        updated[provider] = error;
      } else {
        delete updated[provider];
      }
      return updated;
    });
    
    // Clear test errors when key changes
    setTestErrors(prev => {
      const updated = { ...prev };
      delete updated[provider];
      return updated;
    });
    
    onSettingsChange(newSettings);
  };

  const testConnection = async (provider: string) => {
    const apiKey = settings.aiProvider[`${provider}Key`];
    
    // Validate before testing
    const validationError = validateApiKey(provider, apiKey);
    if (validationError) {
      toast({
        title: "Invalid API Key",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    setTestingConnections(prev => ({ ...prev, [provider]: true }));
    setConnectionStatus(prev => ({ ...prev, [provider]: 'testing' }));
    setTestProgress(prev => ({ ...prev, [provider]: 0 }));
    setTestErrors(prev => {
      const updated = { ...prev };
      delete updated[provider];
      return updated;
    });
    
    try {
      // Simulate progress with more granular updates
      const progressInterval = setInterval(() => {
        setTestProgress(prev => ({
          ...prev,
          [provider]: Math.min((prev[provider] || 0) + 15, 85)
        }));
      }, 200);

      // Configure the provider temporarily for testing
      await aiService.configure(
        provider, 
        apiKey, 
        settings.aiProvider.models[provider]
      );
      
      const isWorking = await aiService.testProvider(provider);
      
      clearInterval(progressInterval);
      setTestProgress(prev => ({ ...prev, [provider]: 100 }));
      
      setTimeout(() => {
        setConnectionStatus(prev => ({
          ...prev,
          [provider]: isWorking ? 'connected' : 'failed'
        }));
        
        if (isWorking) {
          toast({
            title: "✅ Connection Successful",
            description: `${aiProviders.find(p => p.id === provider)?.name} is ready to use`,
          });
        } else {
          const errorMsg = "Connection test failed. Please verify your API key and try again.";
          setTestErrors(prev => ({ ...prev, [provider]: errorMsg }));
          toast({
            title: "❌ Connection Failed",
            description: errorMsg,
            variant: "destructive",
          });
        }
      }, 500);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      let specificError = errorMessage;
      
      // Provide specific error messages based on common issues
      if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
        specificError = "Invalid API key. Please check your key and try again.";
      } else if (errorMessage.includes('403') || errorMessage.includes('forbidden')) {
        specificError = "API key doesn't have required permissions.";
      } else if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
        specificError = "Rate limit exceeded. Please wait and try again.";
      } else if (errorMessage.includes('timeout') || errorMessage.includes('network')) {
        specificError = "Network timeout. Please check your connection and try again.";
      } else if (errorMessage.includes('quota')) {
        specificError = "API quota exceeded. Please check your billing status.";
      }
      
      setConnectionStatus(prev => ({ ...prev, [provider]: 'failed' }));
      setTestErrors(prev => ({ ...prev, [provider]: specificError }));
      
      toast({
        title: "❌ Connection Failed",
        description: specificError,
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setTestingConnections(prev => ({ ...prev, [provider]: false }));
        setTestProgress(prev => ({ ...prev, [provider]: 0 }));
      }, 1000);
    }
  };

  const testAllConnections = async () => {
    const providersWithKeys = aiProviders.filter(provider => 
      settings.aiProvider[`${provider.id}Key`] && !validateApiKey(provider.id, settings.aiProvider[`${provider.id}Key`])
    );
    
    if (providersWithKeys.length === 0) {
      toast({
        title: "No Valid API Keys",
        description: "Please add and validate at least one API key before testing connections.",
        variant: "destructive",
      });
      return;
    }

    for (const provider of providersWithKeys) {
      await testConnection(provider.id);
      // Add delay between tests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-700 border-green-200';
      case 'failed': return 'bg-red-100 text-red-700 border-red-200';
      case 'testing': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <Wifi className="h-3 w-3 mr-1" />;
      case 'failed': return <WifiOff className="h-3 w-3 mr-1" />;
      case 'testing': return <Loader2 className="h-3 w-3 mr-1 animate-spin" />;
      default: return <Key className="h-3 w-3 mr-1" />;
    }
  };

  const shouldHighlight = (text: string) => {
    if (!searchQuery) return false;
    return text.toLowerCase().includes(searchQuery.toLowerCase());
  };

  const currentProvider = aiProviders.find(p => p.id === settings.aiProvider?.primary);
  const configuredProviders = aiProviders.filter(p => settings.aiProvider[`${p.id}Key`]);

  return (
    <div className="space-y-6">
      {/* Current Active Provider - Prominent Display */}
      <Card className="border-pink-200 bg-gradient-to-r from-pink-50 to-rose-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-pink-600 rounded-full flex items-center justify-center text-2xl">
                {currentProvider?.icon || '🤖'}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-semibold text-gray-900">
                    {currentProvider?.name || 'No Provider Selected'}
                  </span>
                  {currentProvider && (
                    <Badge className="bg-pink-100 text-pink-700 border-pink-200">
                      <Star className="h-3 w-3 mr-1" />
                      Primary
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {currentProvider?.description || 'Please select and configure a primary AI provider'}
                </p>
                {currentProvider && (
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span>Model: {settings.aiProvider?.models?.[currentProvider.id] || 'Not selected'}</span>
                    <span>•</span>
                    <span>Reliability: {currentProvider.reliability}%</span>
                    <span>•</span>
                    <span>Avg Response: {currentProvider.avgResponseTime}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {currentProvider && (
                <Badge className={getStatusColor(connectionStatus[currentProvider.id])}>
                  {getStatusIcon(connectionStatus[currentProvider.id])}
                  {connectionStatus[currentProvider.id] === 'connected' ? 'Active' :
                   connectionStatus[currentProvider.id] === 'failed' ? 'Failed' :
                   connectionStatus[currentProvider.id] === 'testing' ? 'Testing' : 'Not Tested'}
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={testAllConnections}
                disabled={Object.values(testingConnections).some(testing => testing)}
                className="border-pink-200 text-pink-600 hover:bg-pink-50"
              >
                {Object.values(testingConnections).some(testing => testing) ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <TestTube className="h-4 w-4 mr-2" />
                )}
                Test All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Provider Configuration - One at a time for clarity */}
      <Card className="border-pink-100">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-pink-600" />
            <span className={shouldHighlight("Configure AI Providers") ? "bg-yellow-200" : ""}>
              Configure AI Providers
            </span>
          </CardTitle>
          <CardDescription>
            Set up your AI providers one by one. Each provider offers different capabilities and pricing.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Provider Selection and Configuration */}
      <div className="space-y-4">
        {aiProviders.map((provider) => (
          <Card 
            key={provider.id} 
            className={`border-pink-100 ${
              settings.aiProvider?.primary === provider.id ? 'ring-2 ring-pink-200 bg-pink-50/30' : ''
            }`}
          >
            <div className="p-4">
              {/* Provider Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id={provider.id}
                    name="aiProvider"
                    value={provider.id}
                    checked={settings.aiProvider?.primary === provider.id}
                    onChange={(e) => onSettingsChange({
                      ...settings,
                      aiProvider: {
                        ...settings.aiProvider,
                        primary: e.target.value
                      }
                    })}
                    className="w-4 h-4 text-pink-600 focus:ring-pink-500"
                  />
                  <div className="text-2xl">{provider.icon}</div>
                  <div>
                    <label htmlFor={provider.id} className="font-medium text-gray-900 cursor-pointer flex items-center space-x-2">
                      <span>{provider.name}</span>
                      {settings.aiProvider?.primary === provider.id && (
                        <Badge className="bg-pink-100 text-pink-700 border-pink-200 text-xs">
                          Primary
                        </Badge>
                      )}
                    </label>
                    <p className="text-sm text-gray-500">{provider.description}</p>
                  </div>
                </div>
                
                {/* Provider Stats */}
                <div className="flex items-center space-x-6">
                  <Badge className={getStatusColor(connectionStatus[provider.id])}>
                    {getStatusIcon(connectionStatus[provider.id])}
                    {connectionStatus[provider.id] === 'connected' ? 'Connected' :
                     connectionStatus[provider.id] === 'failed' ? 'Failed' :
                     connectionStatus[provider.id] === 'testing' ? 'Testing' : 'Not Configured'}
                  </Badge>
                </div>
              </div>
              
              {/* Configuration Section */}
              <div className="space-y-4 pl-7">
                {/* API Key Input */}
                <div>
                  <Label htmlFor={`${provider.id}-key`} className="text-sm font-medium text-gray-700">
                    API Key *
                  </Label>
                  <div className="flex space-x-2 mt-1">
                    <div className="relative flex-1">
                      <Input
                        id={`${provider.id}-key`}
                        type={showApiKeys[provider.id] ? "text" : "password"}
                        placeholder={`Enter your ${provider.name} API key...`}
                        value={settings.aiProvider[`${provider.id}Key`] || ''}
                        onChange={(e) => updateApiKey(provider.id, e.target.value)}
                        className={`pr-10 ${
                          validationErrors[provider.id] 
                            ? 'border-red-300 focus:border-red-500' 
                            : settings.aiProvider[`${provider.id}Key`] && !validationErrors[provider.id]
                            ? 'border-green-300 focus:border-green-500'
                            : ''
                        }`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowApiKeys(prev => ({
                          ...prev,
                          [provider.id]: !prev[provider.id]
                        }))}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                      >
                        {showApiKeys[provider.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testConnection(provider.id)}
                      disabled={
                        testingConnections[provider.id] || 
                        !settings.aiProvider[`${provider.id}Key`] || 
                        !!validationErrors[provider.id]
                      }
                      className="border-pink-200 text-pink-600 hover:bg-pink-50 min-w-[80px]"
                    >
                      {testingConnections[provider.id] ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <TestTube className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  {/* Real-time validation and error messages */}
                  {validationErrors[provider.id] && (
                    <p className="text-xs text-red-600 mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {validationErrors[provider.id]}
                    </p>
                  )}
                  
                  {testErrors[provider.id] && (
                    <p className="text-xs text-red-600 mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {testErrors[provider.id]}
                    </p>
                  )}
                  
                  {settings.aiProvider[`${provider.id}Key`] && !validationErrors[provider.id] && !testErrors[provider.id] && (
                    <p className="text-xs text-green-600 mt-1 flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      API key format is valid
                    </p>
                  )}
                  
                  {/* Progress bar for testing */}
                  {testingConnections[provider.id] && (
                    <div className="mt-2">
                      <Progress value={testProgress[provider.id] || 0} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">
                        Testing connection to {provider.name}...
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Model Selection - Always visible with descriptions */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Model Selection
                  </Label>
                  <Select
                    value={settings.aiProvider?.models?.[provider.id] || provider.models[0].id}
                    onValueChange={(value) => onSettingsChange({
                      ...settings,
                      aiProvider: {
                        ...settings.aiProvider,
                        models: {
                          ...settings.aiProvider.models,
                          [provider.id]: value
                        }
                      }
                    })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {provider.models.map((model) => (
                        <SelectItem key={model.id} value={model.id} className="cursor-pointer">
                          <div className="w-full py-2">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">{model.name}</span>
                                {model.recommended && (
                                  <Badge className="bg-blue-100 text-blue-700 text-xs">
                                    <Star className="h-2 w-2 mr-1" />
                                    Recommended
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="text-xs text-gray-600 mb-2">{model.description}</div>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div>
                                <span className="text-gray-400">Speed:</span>
                                <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                                  <div 
                                    className="bg-blue-600 h-1 rounded-full" 
                                    style={{width: `${model.speed}%`}}
                                  />
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-400">Quality:</span>
                                <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                                  <div 
                                    className="bg-green-600 h-1 rounded-full" 
                                    style={{width: `${model.capability}%`}}
                                  />
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-400">Cost:</span>
                                <div className="flex items-center mt-1">
                                  {'$'.repeat(model.cost)}
                                  {'○'.repeat(5 - model.cost)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Status Summary */}
      <Card className="border-blue-100 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Configuration Status</h4>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Configured providers:</span> {configuredProviders.length} of {aiProviders.length}
                </p>
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Active provider:</span> {currentProvider?.name || 'None selected'}
                </p>
                {configuredProviders.length > 1 && (
                  <p className="text-xs text-blue-700 mt-2">
                    💡 Multiple providers configured - automatic fallback enabled for maximum reliability
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
