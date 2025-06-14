
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { chromeStorage } from "@/utils/chromeStorage";
import { smartDefaultsService } from "@/services/smartDefaultsService";
import { providerFallbackService } from "@/services/providerFallbackService";

// Type can be improved if a common type is available for Settings
export const useSettings = (onNavigate: (tab: string) => void) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("providers");
  const [searchQuery, setSearchQuery] = useState("");
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);

  useEffect(() => {
    loadSettings();
    initializeServices();
    // eslint-disable-next-line
  }, []);

  const initializeServices = async () => {
    try {
      await smartDefaultsService.initialize();
    } catch (error) {
      console.warn('Failed to initialize smart defaults:', error);
    }
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedSettings = await chromeStorage.getSettings();

      // Check if this is first time (no API keys configured)
      const hasApiKeys = loadedSettings?.aiProvider?.openaiKey ||
        loadedSettings?.aiProvider?.claudeKey ||
        loadedSettings?.aiProvider?.geminiKey;

      if (!hasApiKeys) {
        setIsFirstTime(true);
        setShowWizard(true);
      }

      const finalSettings = loadedSettings || getDefaultSettings();
      setSettings(finalSettings);

      // Initialize provider fallback service with configured providers
      if (finalSettings.aiProvider) {
        initializeProviderFallback(finalSettings.aiProvider);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      setError('Failed to load settings. Please refresh and try again.');
      setSettings(getDefaultSettings());
    } finally {
      setLoading(false);
    }
  };

  const initializeProviderFallback = (aiProviderSettings: any) => {
    const providers = [
      { id: 'openai', name: 'OpenAI', priority: 1 },
      { id: 'claude', name: 'Claude', priority: 2 },
      { id: 'gemini', name: 'Gemini', priority: 3 }
    ];

    providers.forEach(provider => {
      const apiKey = aiProviderSettings[`${provider.id}Key`];
      if (apiKey) {
        providerFallbackService.addProvider({
          ...provider,
          apiKey,
          model: aiProviderSettings.models?.[provider.id] || 'default'
        });
      }
    });
  };

  const getDefaultSettings = () => {
    if (isFirstTime) {
      return smartDefaultsService.getSmartDefaults('new-user');
    }

    return {
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
        autoGainControl: true,
        confidenceThreshold: 75,
        fillerSensitivity: 3
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
      },
      privacy: {
        localDataProcessing: true,
        sessionRecording: true
      }
    };
  };

  const saveSettings = async (newSettings: any) => {
    try {
      await chromeStorage.saveSettings(newSettings);
      setSettings(newSettings);
      initializeProviderFallback(newSettings.aiProvider);
      smartDefaultsService.recordSuccessfulConfig(newSettings);
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

  const handleWizardComplete = async (wizardSettings: any) => {
    await saveSettings(wizardSettings);
    setShowWizard(false);
    setIsFirstTime(false);
    toast({
      title: "Welcome to CandidAI!",
      description: "Your personalized setup is complete. You can always adjust settings later.",
    });
  };

  const handleWizardSkip = () => {
    setShowWizard(false);
    setIsFirstTime(false);
  };

  const resetSection = (section: string) => {
    const defaultSettings = getDefaultSettings();
    const newSettings = { ...settings };
    newSettings[section] = defaultSettings[section];
    saveSettings(newSettings);
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
      version: "2.0"
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

  const handleSearchNavigation = (section: string, subsection?: string) => {
    setActiveTab(section);
    if (subsection) {
      console.log(`Navigate to ${section} -> ${subsection}`);
    }
  };

  return {
    activeTab, setActiveTab,
    searchQuery, setSearchQuery,
    settings, setSettings,
    loading, setLoading,
    error, setError,
    showWizard, setShowWizard,
    isFirstTime, setIsFirstTime,
    onNavigate,
    loadSettings,
    resetSection,
    resetAllSettings,
    exportSettings,
    importSettings,
    saveSettings,
    handleWizardComplete,
    handleWizardSkip,
    handleSearchNavigation
  };
};
