
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BulkActionsPanel } from "./BulkActionsPanel";
import { BackupManager } from "./BackupManager";
import { UsageMonitor } from "./UsageMonitor";
import { SettingsValidator } from "./SettingsValidator";
import { ABTestingPanel } from "./ABTestingPanel";

interface AdvancedFeaturesTabProps {
  settings: any;
  onSettingsChange: (settings: any) => void;
  onExportSettings: () => void;
}

export const AdvancedFeaturesTab = ({ settings, onSettingsChange, onExportSettings }: AdvancedFeaturesTabProps) => {
  const handleTestResults = (results: any) => {
    console.log('Test results:', results);
  };

  const handleFixIssue = (fix: any) => {
    if (fix.action === 'setSetting') {
      const newSettings = { ...settings };
      let current = newSettings;
      for (let i = 0; i < fix.path.length - 1; i++) {
        if (!current[fix.path[i]]) current[fix.path[i]] = {};
        current = current[fix.path[i]];
      }
      current[fix.path[fix.path.length - 1]] = fix.value;
      onSettingsChange(newSettings);
    }
  };

  return (
    <Tabs defaultValue="validation" className="w-full">
      <TabsList className="grid w-full grid-cols-5 mb-6">
        <TabsTrigger value="validation">Validation</TabsTrigger>
        <TabsTrigger value="bulk">Bulk Actions</TabsTrigger>
        <TabsTrigger value="usage">Usage Monitor</TabsTrigger>
        <TabsTrigger value="backup">Backup</TabsTrigger>
        <TabsTrigger value="testing">A/B Testing</TabsTrigger>
      </TabsList>

      <TabsContent value="validation" className="space-y-6">
        <SettingsValidator 
          settings={settings} 
          onFixIssue={handleFixIssue}
        />
      </TabsContent>

      <TabsContent value="bulk" className="space-y-6">
        <BulkActionsPanel 
          settings={settings} 
          onTestResults={handleTestResults}
        />
      </TabsContent>

      <TabsContent value="usage" className="space-y-6">
        <UsageMonitor settings={settings} />
      </TabsContent>

      <TabsContent value="backup" className="space-y-6">
        <BackupManager 
          settings={settings}
          onImportSettings={onSettingsChange}
          onExportSettings={onExportSettings}
        />
      </TabsContent>

      <TabsContent value="testing" className="space-y-6">
        <ABTestingPanel 
          settings={settings}
          onApplyConfiguration={onSettingsChange}
        />
      </TabsContent>
    </Tabs>
  );
};
