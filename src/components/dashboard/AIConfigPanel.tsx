
import { memo } from "react";
import { useAIConfig } from "@/hooks/useAIConfig";
import { ConfigHeader } from "./config/ConfigHeader";
import { LoadingState } from "./config/LoadingState";
import { AIProviderConfig } from "./config/AIProviderConfig";
import { ResponseConfig } from "./config/ResponseConfig";
import { FeatureToggles } from "./config/FeatureToggles";

export const AIConfigPanel = memo(() => {
  const { config, isLoading, isSaving, updateConfig, saveConfiguration } = useAIConfig();

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <ConfigHeader isSaving={isSaving} onSave={saveConfiguration} />
      <AIProviderConfig config={config} onConfigChange={updateConfig} />
      <ResponseConfig config={config} onConfigChange={updateConfig} />
      <FeatureToggles config={config} onConfigChange={updateConfig} />
    </div>
  );
});

AIConfigPanel.displayName = 'AIConfigPanel';
