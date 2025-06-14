
import { useToast } from "@/hooks/use-toast";

export const useSettingsImportExport = (
  settings: any,
  saveSettings: (settings: any) => Promise<void>
) => {
  const { toast } = useToast();

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

  return {
    exportSettings,
    importSettings
  };
};
