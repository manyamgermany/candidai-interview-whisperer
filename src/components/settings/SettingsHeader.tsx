
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowLeft, Settings, Download, Upload, RotateCcw } from "lucide-react";
import { ConfigTemplates } from "./ConfigTemplates";
import { SectionResetButtons } from "./SectionResetButtons";

interface SettingsHeaderProps {
  onNavigate: (tab: string) => void;
  setShowWizard: (v: boolean) => void;
  importSettings: (e: React.ChangeEvent<HTMLInputElement>) => void;
  exportSettings: () => void;
  resetSection: (s: string) => void;
  resetAllSettings: () => void;
  saveSettings: (s: any) => void;
}

export const SettingsHeader = ({
  onNavigate,
  setShowWizard,
  importSettings,
  exportSettings,
  resetSection,
  resetAllSettings,
  saveSettings
}: SettingsHeaderProps) => (
  <header className="bg-white/80 backdrop-blur-sm border-b border-pink-100 sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center space-x-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate("dashboard")}
                  className="text-gray-600 hover:text-pink-600"
                  aria-label="Back to Dashboard"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Back to Dashboard</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center">
              <Settings className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Settings & Configuration</h1>
              <p className="text-xs text-gray-500">Customize your CandidAI experience</p>
            </div>
          </div>
        </div>
        <TooltipProvider>
          <div className="flex items-center space-x-1">
            <ConfigTemplates onApplyTemplate={saveSettings} />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowWizard(true)}
                  className="h-8 w-8 p-0 text-gray-600 hover:text-pink-600"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Setup Wizard</p>
              </TooltipContent>
            </Tooltip>
            <input
              type="file"
              accept=".json"
              onChange={importSettings}
              style={{ display: 'none' }}
              id="import-settings"
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => document.getElementById('import-settings')?.click()}
                  className="h-8 w-8 p-0 text-gray-600 hover:text-pink-600"
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Import Settings</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={exportSettings}
                  className="h-8 w-8 p-0 text-gray-600 hover:text-pink-600"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Export Settings</p>
              </TooltipContent>
            </Tooltip>
            <SectionResetButtons onResetSection={resetSection} />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetAllSettings}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reset All Settings</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>
    </div>
  </header>
);
