
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { chromeStorage } from "@/utils/chromeStorage";
import { ArrowLeft, Settings, Download, Upload, RotateCcw } from "lucide-react";
import { AIProviderSection } from "./settings/AIProviderSection";
import { ResponseConfigSection } from "./settings/ResponseConfigSection";
import { AudioSettingsSection } from "./settings/AudioSettingsSection";
import { PrivacySection } from "./settings/PrivacySection";
import { QuickSettingsSidebar } from "./settings/QuickSettingsSidebar";
import { SettingsErrorBoundary } from "./settings/SettingsErrorBoundary";
import { SettingsSearch } from "./settings/SettingsSearch";
import { ConfigTemplates } from "./settings/ConfigTemplates";

interface SettingsPanelProps {
  onNavigate: (tab: string) => void;
}

const SettingsPanel = ({ onNavigate }: SettingsPanelProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("providers");
  const [searchQuery, setSearchQuery] = useState("");
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedSettings = await chromeStorage.getSettings();
      setSettings(loadedSettings || getDefaultSettings());
    } catch (error) {
      console.error('Failed to load settings:', error);
      setError('Failed to load settings. Please refresh and try again.');
      setSettings(getDefaultSettings());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultSettings = () => ({
    aiProvider: {
      primary: "openai",
      openaiKey: '',
      claudeKey: '',
      geminiKey: '',
      models: {
        openai: 'gpt-4o-mini',
        claude: 'claude-3-haiku-20240307',
        gemini: 'gemini-pro'
      }
    },
    responseStyle: {
      tone: "professional",
      length: 'medium',
      formality: 'formal'
    },
    audio: {
      inputDevice: 'default',
      outputDevice: 'default',
      noiseReduction: false,
      autoGainControl: true
    },
    coaching: {
      enableRealtime: true,
      frameworks: ['star', 'soar'],
      experienceLevel: 'mid'
    },
    analytics: {
      enableTracking: false,
      trackWPM: true,
      trackFillers: true,
      trackConfidence: true
    }
  });

  const saveSettings = async (newSettings: any) => {
    try {
      await chromeStorage.saveSettings(newSettings);
      setSettings(newSettings);
      
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

  const resetAllSettings = () => {
    const defaultSettings = getDefaultSettings();
    saveSettings(defaultSettings);
    
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to defaults.",
    });
  };

  const exportSettings = () => {
    const exportData = {
      ...settings,
      exportedAt: new Date().toISOString(),
      version: "1.0"
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `candidai-settings-${new Date().toISOString().split('T')[0]}.json`;
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
        const importedSettings = JSON.parse(e.target?.result as string);
        
        // Validate imported settings structure
        if (!importedSettings.aiProvider || !importedSettings.responseStyle) {
          throw new Error("Invalid settings file format");
        }
        
        saveSettings(importedSettings);
        
        toast({
          title: "Settings Imported",
          description: "Settings have been successfully imported.",
        });
      } catch (error) {
        toast({
          title: "Import Error",
          description: "Failed to import settings. Please check the file format.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Settings Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadSettings}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <SettingsErrorBoundary>
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
                  aria-label="Back to Dashboard"
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
              
              {/* Search and Actions */}
              <div className="flex items-center space-x-3">
                <SettingsSearch 
                  searchQuery={searchQuery} 
                  onSearchChange={setSearchQuery}
                  onTabChange={setActiveTab}
                />
                <ConfigTemplates onApplyTemplate={saveSettings} />
                <input
                  type="file"
                  accept=".json"
                  onChange={importSettings}
                  style={{ display: 'none' }}
                  id="import-settings"
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => document.getElementById('import-settings')?.click()}
                  className="border-pink-200 text-pink-600 hover:bg-pink-50"
                  aria-label="Import Settings"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={exportSettings}
                  className="border-pink-200 text-pink-600 hover:bg-pink-50"
                  aria-label="Export Settings"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={resetAllSettings}
                  className="border-pink-200 text-pink-600 hover:bg-pink-50"
                  aria-label="Reset to Defaults"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset All
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-8" role="tablist">
                  <TabsTrigger value="providers" role="tab" aria-selected={activeTab === 'providers'}>
                    AI Providers
                  </TabsTrigger>
                  <TabsTrigger value="response" role="tab" aria-selected={activeTab === 'response'}>
                    Response Config
                  </TabsTrigger>
                  <TabsTrigger value="audio" role="tab" aria-selected={activeTab === 'audio'}>
                    Audio & Speech
                  </TabsTrigger>
                  <TabsTrigger value="privacy" role="tab" aria-selected={activeTab === 'privacy'}>
                    Privacy & Security
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="providers" role="tabpanel">
                  <AIProviderSection 
                    settings={settings} 
                    onSettingsChange={saveSettings}
                    searchQuery={searchQuery}
                  />
                </TabsContent>

                <TabsContent value="response" role="tabpanel">
                  <ResponseConfigSection 
                    settings={settings} 
                    onSettingsChange={saveSettings}
                    searchQuery={searchQuery}
                  />
                </TabsContent>

                <TabsContent value="audio" role="tabpanel">
                  <AudioSettingsSection 
                    settings={settings} 
                    onSettingsChange={saveSettings}
                    searchQuery={searchQuery}
                  />
                </TabsContent>

                <TabsContent value="privacy" role="tabpanel">
                  <PrivacySection 
                    settings={settings} 
                    onSettingsChange={saveSettings}
                    searchQuery={searchQuery}
                  />
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <QuickSettingsSidebar 
                settings={settings} 
                onSettingsChange={saveSettings}
              />
            </div>
          </div>
        </div>
      </div>
    </SettingsErrorBoundary>
  );
};

export default SettingsPanel;
