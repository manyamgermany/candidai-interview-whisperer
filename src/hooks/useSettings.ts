
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { chromeStorage } from "@/utils/chromeStorage";
import { smartDefaultsService } from "@/services/smartDefaultsService";
import { providerFallbackService } from "@/services/providerFallbackService";
import { useSettingsWizard } from "./useSettingsWizard";
import { useSettingsImportExport } from "./useSettingsImportExport";
import { getDefaultSettings } from "@/utils/settingsDefaults";

export const useSettings = (onNavigate: (tab: string) => void) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("providers");
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const wizard = useSettingsWizard(saveSettings);
  const importExport = useSettingsImportExport(settings, saveSettings);

  useEffect(() => {
    loadSettings();
    initializeServices();
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

      wizard.checkFirstTimeUser(loadedSettings);

      const finalSettings = loadedSettings || getDefaultSettings(wizard.isFirstTime);
      setSettings(finalSettings);

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

  return {
    activeTab,
    setActiveTab,
    settings,
    loading,
    error,
    loadSettings,
    resetSection,
    resetAllSettings,
    saveSettings,
    ...wizard,
    ...importExport
  };
};
