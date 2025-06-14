
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIProviderSection } from "./AIProviderSection";
import { ResponseConfigSection } from "./ResponseConfigSection";
import { AudioSettingsSection } from "./AudioSettingsSection";
import { PrivacySection } from "./PrivacySection";
import { QuickSettingsSidebar } from "./QuickSettingsSidebar";
import { AdvancedFeaturesTab } from "./AdvancedFeaturesTab";

interface SettingsTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  settings: any;
  saveSettings: (s: any) => void;
  searchQuery: string;
  resetSection: (section: string) => void;
  exportSettings: () => void;
}

export const SettingsTabs = ({
  activeTab,
  setActiveTab,
  settings,
  saveSettings,
  searchQuery,
  resetSection,
  exportSettings
}: SettingsTabsProps) => (
  <div className="grid lg:grid-cols-4 gap-8">
    <div className="lg:col-span-3">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-8" role="tablist">
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
          <TabsTrigger value="advanced" role="tab" aria-selected={activeTab === 'advanced'}>
            Advanced Features
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
        <TabsContent value="advanced" role="tabpanel">
          <AdvancedFeaturesTab
            settings={settings}
            onSettingsChange={saveSettings}
            onExportSettings={exportSettings}
          />
        </TabsContent>
      </Tabs>
    </div>
    <div className="lg:col-span-1">
      <QuickSettingsSidebar
        settings={settings}
        onSettingsChange={saveSettings}
      />
    </div>
  </div>
);
