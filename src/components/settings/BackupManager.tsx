
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Download, Upload, FileText, History, Trash2, CheckCircle } from "lucide-react";

interface BackupManagerProps {
  settings: any;
  onImportSettings: (settings: any) => void;
  onExportSettings: () => void;
}

export const BackupManager = ({ settings, onImportSettings, onExportSettings }: BackupManagerProps) => {
  const { toast } = useToast();
  const [backupHistory, setBackupHistory] = useState([
    { id: 1, name: "Auto Backup", date: "2024-12-14T10:30:00Z", type: "automatic", size: "2.1 KB" },
    { id: 2, name: "Pre-Migration Backup", date: "2024-12-13T15:45:00Z", type: "manual", size: "2.0 KB" },
    { id: 3, name: "Weekly Backup", date: "2024-12-10T09:00:00Z", type: "scheduled", size: "1.9 KB" }
  ]);

  const createBackup = () => {
    const backup = {
      id: Date.now(),
      name: `Manual Backup ${new Date().toLocaleDateString()}`,
      date: new Date().toISOString(),
      type: "manual",
      size: "2.1 KB",
      settings: settings
    };

    setBackupHistory(prev => [backup, ...prev]);
    onExportSettings();

    toast({
      title: "Backup Created",
      description: "Settings backup has been created and downloaded.",
    });
  };

  const restoreBackup = (backup: any) => {
    if (backup.settings) {
      onImportSettings(backup.settings);
      toast({
        title: "Settings Restored",
        description: `Settings restored from ${backup.name}`,
      });
    }
  };

  const deleteBackup = (backupId: number) => {
    setBackupHistory(prev => prev.filter(b => b.id !== backupId));
    toast({
      title: "Backup Deleted",
      description: "Backup has been removed from history.",
    });
  };

  const importFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target?.result as string);
        
        if (!importedSettings.aiProvider || !importedSettings.responseStyle) {
          throw new Error("Invalid settings file format");
        }

        onImportSettings(importedSettings);
        
        // Add to backup history
        const backup = {
          id: Date.now(),
          name: `Imported: ${file.name}`,
          date: new Date().toISOString(),
          type: "imported",
          size: `${(file.size / 1024).toFixed(1)} KB`,
          settings: importedSettings
        };
        setBackupHistory(prev => [backup, ...prev]);

        toast({
          title: "Settings Imported",
          description: "Settings have been successfully imported and applied.",
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "automatic": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "manual": return <FileText className="h-4 w-4 text-blue-600" />;
      case "scheduled": return <History className="h-4 w-4 text-purple-600" />;
      case "imported": return <Upload className="h-4 w-4 text-orange-600" />;
      default: return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "automatic": return "bg-green-100 text-green-700 border-green-200";
      case "manual": return "bg-blue-100 text-blue-700 border-blue-200";
      case "scheduled": return "bg-purple-100 text-purple-700 border-purple-200";
      case "imported": return "bg-orange-100 text-orange-700 border-orange-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <Card className="border-green-100">
      <CardHeader>
        <CardTitle className="text-lg flex items-center space-x-2">
          <History className="h-5 w-5 text-green-600" />
          <span>Backup Management</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-3">
          <Button onClick={createBackup} className="bg-green-600 hover:bg-green-700">
            <Download className="h-4 w-4 mr-2" />
            Create Backup
          </Button>
          
          <input
            type="file"
            accept=".json"
            onChange={importFile}
            style={{ display: 'none' }}
            id="import-backup"
          />
          <Button 
            variant="outline" 
            onClick={() => document.getElementById('import-backup')?.click()}
            className="border-green-200 text-green-600 hover:bg-green-50"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import Backup
          </Button>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium">Backup History</h4>
          {backupHistory.map((backup) => (
            <div key={backup.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {getTypeIcon(backup.type)}
                <div>
                  <div className="font-medium">{backup.name}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(backup.date).toLocaleString()} • {backup.size}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className={getTypeBadgeColor(backup.type)}>
                  {backup.type}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => restoreBackup(backup)}
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  Restore
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteBackup(backup.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
