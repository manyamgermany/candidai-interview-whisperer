
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { storageService } from "@/services/storageService";
import { AIConfig } from "@/types/storageTypes";

export const useAIConfig = () => {
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

  const loadConfiguration = useCallback(async () => {
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
  }, [toast]);

  const saveConfiguration = useCallback(async () => {
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
  }, [config, toast]);

  const updateConfig = useCallback((updates: Partial<AIConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  useEffect(() => {
    loadConfiguration();
  }, [loadConfiguration]);

  return {
    config,
    isLoading,
    isSaving,
    updateConfig,
    saveConfiguration
  };
};
