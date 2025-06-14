
// Refactored SettingsPanel to use smaller, focused components and split logic/UI. 
import { SettingsErrorBoundary } from "./settings/SettingsErrorBoundary";
import { useSettings } from "@/hooks/useSettings";
import { SettingsHeader } from "./settings/SettingsHeader";
import { SettingsTabs } from "./settings/SettingsTabs";
import { SettingsLoader } from "./settings/SettingsLoader";
import { SetupWizardModal } from "./settings/SetupWizardModal";

interface SettingsPanelProps {
  onNavigate: (tab: string) => void;
}

const SettingsPanel = ({ onNavigate }: SettingsPanelProps) => {
  const {
    activeTab, setActiveTab,
    settings,
    loading,
    error,
    showWizard, setShowWizard,
    resetSection,
    resetAllSettings,
    exportSettings,
    importSettings,
    saveSettings,
    handleWizardComplete,
    handleWizardSkip,
    loadSettings
  } = useSettings(onNavigate);

  if (loading || error) {
    return <SettingsLoader loading={loading} error={error} loadSettings={loadSettings} />;
  }

  return (
    <SettingsErrorBoundary>
      <SetupWizardModal
        showWizard={showWizard}
        handleWizardComplete={handleWizardComplete}
        handleWizardSkip={handleWizardSkip}
      />
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
        <SettingsHeader
          onNavigate={onNavigate}
          setShowWizard={setShowWizard}
          importSettings={importSettings}
          exportSettings={exportSettings}
          resetSection={resetSection}
          resetAllSettings={resetAllSettings}
          saveSettings={saveSettings}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <SettingsTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            settings={settings}
            saveSettings={saveSettings}
            resetSection={resetSection}
            exportSettings={exportSettings}
          />
        </div>
      </div>
    </SettingsErrorBoundary>
  );
};

export default SettingsPanel;
