
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export const useSettingsWizard = (
  saveSettings: (settings: any) => Promise<void>
) => {
  const { toast } = useToast();
  const [showWizard, setShowWizard] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);

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

  const checkFirstTimeUser = (settings: any) => {
    const hasApiKeys = settings?.aiProvider?.openaiKey ||
      settings?.aiProvider?.claudeKey ||
      settings?.aiProvider?.geminiKey;

    if (!hasApiKeys) {
      setIsFirstTime(true);
      setShowWizard(true);
    }
  };

  return {
    showWizard,
    setShowWizard,
    isFirstTime,
    setIsFirstTime,
    handleWizardComplete,
    handleWizardSkip,
    checkFirstTimeUser
  };
};
