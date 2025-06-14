
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
  EyeOff
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

  const aiProviders = [
    { 
      id: "openai", 
      name: "OpenAI", 
      description: "Most reliable for conversational AI and structured responses",
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
          capability: 85
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
          capability: 90
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
          capability: 88
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
    const errors: Record<string, string> = {};
    
    if (!key.trim()) {
      errors[provider] = "API key is required";
      return errors;
    }

    switch (provider) {
      case 'openai':
        if (!key.startsWith('sk-')) {
          errors[provider] = "OpenAI API keys should start with 'sk-'";
        } else if (key.length < 45) {
          errors[provider] = "OpenAI API key appears to be too short";
        }
        break;
      case 'claude':
        if (!key.startsWith('sk-ant-')) {
          errors[provider] = "Claude API keys should start with 'sk-ant-'";
        }
        break;
      case 'gemini':
        if (key.length < 35) {
          errors[provider] = "Gemini API key appears to be too short";
        }
        break;
    }
    
    return errors;
  };

  const updateApiKey = (provider: string, key: string) => {
    const newSettings = {
      ...settings,
      aiProvider: {
        ...settings.aiProvider,
        [`${provider}Key`]: key
      }
    };
    
    // Validate the key
    const errors = validateApiKey(provider, key);
    setValidationErrors(prev => ({
      ...prev,
      ...errors
    }));
    
    // Clear validation error if key is valid
    if (!errors[provider] && validationErrors[provider]) {
      setValidationErrors(prev => {
        const updated = { ...prev };
        delete updated[provider];
        return updated;
      });
    }
    
    onSettingsChange(newSettings);
  };

  const testConnection = async (provider: string) => {
    const apiKey = settings.aiProvider[`${provider}Key`];
    
    // Validate before testing
    const errors = validateApiKey(provider, apiKey);
    if (errors[provider]) {
      toast({
        title: "Invalid API Key",
        description: errors[provider],
        variant: "destructive",
      });
      return;
    }

    setTestingConnections(prev => ({ ...prev, [provider]: true }));
    setConnectionStatus(prev => ({ ...prev, [provider]: 'testing' }));
    setTestProgress(prev => ({ ...prev, [provider]: 0 }));
    
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setTestProgress(prev => ({
          ...prev,
          [provider]: Math.min((prev[provider] || 0) + 20, 90)
        }));
      }, 300);

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
        
        toast({
          title: isWorking ? "Connection Successful" : "Connection Failed",
          description: isWorking 
            ? `Successfully connected to ${provider}` 
            : `Failed to connect to ${provider}. Please check your API key.`,
          variant: isWorking ? "default" : "destructive",
        });
      }, 500);
      
    } catch (error) {
      setConnectionStatus(prev => ({ ...prev, [provider]: 'failed' }));
      toast({
        title: "Connection Failed",
        description: `Error testing ${provider}: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
      settings.aiProvider[`${provider.id}Key`]
    );
    
    if (providersWithKeys.length === 0) {
      toast({
        title: "No API Keys",
        description: "Please add at least one API key before testing connections.",
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
      case 'connected': return <CheckCircle className="h-3 w-3 mr-1" />;
      case 'failed': return <AlertCircle className="h-3 w-3 mr-1" />;
      case 'testing': return <Loader2 className="h-3 w-3 mr-1 animate-spin" />;
      default: return <Key className="h-3 w-3 mr-1" />;
    }
  };

  const shouldHighlight = (text: string) => {
    if (!searchQuery) return false;
    return text.toLowerCase().includes(searchQuery.toLowerCase());
  };

  return (
    <div className="space-y-6">
      {/* Header with bulk actions */}
      <Card className="border-pink-100">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-pink-600" />
                <span className={shouldHighlight("AI Provider Configuration") ? "bg-yellow-200" : ""}>
                  AI Provider Configuration
                </span>
              </CardTitle>
              <CardDescription>
                Configure your AI assistants with enhanced testing and validation
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={testAllConnections}
                className="border-pink-200 text-pink-600 hover:bg-pink-50"
                disabled={Object.values(testingConnections).some(testing => testing)}
              >
                <TestTube className="h-4 w-4 mr-2" />
                Test All Connections
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Current Primary Provider Indicator */}
      <Card className="border-pink-100 bg-pink-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-pink-600 rounded-full"></div>
              <span className="font-medium">Primary Provider:</span>
              <span className="text-pink-600 font-semibold">
                {aiProviders.find(p => p.id === settings.aiProvider?.primary)?.name || 'Not Selected'}
              </span>
            </div>
            <Badge className="bg-pink-100 text-pink-700 border-pink-200">
              Active
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Provider Configuration Cards */}
      <div className="space-y-4">
        {aiProviders.map((provider) => (
          <Card key={provider.id} className="border-pink-100 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-pink-100">
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
                  aria-describedby={`${provider.id}-description`}
                />
                <div className="flex-1">
                  <label htmlFor={provider.id} className="font-medium text-gray-900 cursor-pointer">
                    {provider.name}
                  </label>
                  <p id={`${provider.id}-description`} className="text-sm text-gray-500">
                    {provider.description}
                  </p>
                </div>
              </div>
              
              {/* Provider Stats */}
              <div className="flex items-center space-x-6 text-sm">
                <div className="text-center">
                  <div className="font-medium">{provider.reliability}%</div>
                  <div className="text-gray-500 text-xs">Reliability</div>
                </div>
                <div className="text-center">
                  <div className="font-medium flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {provider.avgResponseTime}
                  </div>
                  <div className="text-gray-500 text-xs">Response Time</div>
                </div>
                <div className="text-center">
                  <div className="font-medium flex items-center">
                    <DollarSign className="h-3 w-3 mr-1" />
                    {'$'.repeat(provider.costRating)}
                  </div>
                  <div className="text-gray-500 text-xs">Cost Level</div>
                </div>
                <Badge className={getStatusColor(connectionStatus[provider.id])}>
                  {getStatusIcon(connectionStatus[provider.id])}
                  {connectionStatus[provider.id] === 'connected' ? 'Connected' :
                   connectionStatus[provider.id] === 'failed' ? 'Failed' :
                   connectionStatus[provider.id] === 'testing' ? 'Testing' : 'Inactive'}
                </Badge>
              </div>
            </div>
            
            <div className="p-4 space-y-4 bg-gray-50">
              {/* API Key Input */}
              <div>
                <Label htmlFor={`${provider.id}-key`} className="text-sm text-gray-700 font-medium">
                  API Key
                  {validationErrors[provider.id] && (
                    <span className="text-red-500 ml-2 text-xs">⚠ {validationErrors[provider.id]}</span>
                  )}
                </Label>
                <div className="flex space-x-2 mt-1">
                  <div className="relative flex-1">
                    <Input
                      id={`${provider.id}-key`}
                      type={showApiKeys[provider.id] ? "text" : "password"}
                      placeholder="Enter API key..."
                      value={settings.aiProvider[`${provider.id}Key`] || ''}
                      onChange={(e) => updateApiKey(provider.id, e.target.value)}
                      className={`pr-10 ${validationErrors[provider.id] ? 'border-red-300 focus:border-red-500' : ''}`}
                      aria-describedby={validationErrors[provider.id] ? `${provider.id}-error` : undefined}
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
                      aria-label={showApiKeys[provider.id] ? "Hide API key" : "Show API key"}
                    >
                      {showApiKeys[provider.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => testConnection(provider.id)}
                    disabled={testingConnections[provider.id] || !settings.aiProvider[`${provider.id}Key`] || !!validationErrors[provider.id]}
                    className="border-pink-200 text-pink-600 hover:bg-pink-50 min-w-[80px]"
                    aria-label={`Test ${provider.name} connection`}
                  >
                    {testingConnections[provider.id] ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <TestTube className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                {/* Progress bar for testing */}
                {testingConnections[provider.id] && (
                  <div className="mt-2">
                    <Progress value={testProgress[provider.id] || 0} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">Testing connection...</p>
                  </div>
                )}
              </div>
              
              {/* Model Selection */}
              <div>
                <Label htmlFor={`${provider.id}-model`} className="text-sm text-gray-700 font-medium">
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
                  <SelectTrigger className="mt-1" id={`${provider.id}-model`}>
                    <SelectValue placeholder="Select model..." />
                  </SelectTrigger>
                  <SelectContent>
                    {provider.models.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        <div className="w-full">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{model.name}</span>
                            <div className="flex items-center space-x-2 ml-4">
                              <div className="flex items-center text-xs text-gray-500">
                                <Zap className="h-3 w-3 mr-1" />
                                {model.speed}%
                              </div>
                              <div className="flex items-center text-xs text-gray-500">
                                <DollarSign className="h-3 w-3 mr-1" />
                                {'$'.repeat(model.cost)}
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">{model.description}</div>
                          <div className="flex space-x-4 mt-1">
                            <div className="text-xs">
                              <span className="text-gray-400">Speed:</span>
                              <div className="w-12 bg-gray-200 rounded-full h-1 mt-1">
                                <div 
                                  className="bg-blue-600 h-1 rounded-full" 
                                  style={{width: `${model.speed}%`}}
                                ></div>
                              </div>
                            </div>
                            <div className="text-xs">
                              <span className="text-gray-400">Capability:</span>
                              <div className="w-12 bg-gray-200 rounded-full h-1 mt-1">
                                <div 
                                  className="bg-green-600 h-1 rounded-full" 
                                  style={{width: `${model.capability}%`}}
                                ></div>
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
          </Card>
        ))}
      </div>

      {/* Fallback Information */}
      <Card className="border-blue-100 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Intelligent Fallback System</h4>
              <p className="text-sm text-blue-800 mt-1">
                CandidAI automatically switches to backup providers if the primary fails, ensuring uninterrupted assistance. 
                Configure multiple providers for maximum reliability.
              </p>
              <div className="mt-2 text-xs text-blue-700">
                <span className="font-medium">Current Fallback Order:</span> {settings.aiProvider?.primary} → 
                {aiProviders.filter(p => p.id !== settings.aiProvider?.primary && settings.aiProvider[`${p.id}Key`])
                  .map(p => p.name).join(' → ') || ' (No backup configured)'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
