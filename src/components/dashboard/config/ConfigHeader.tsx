
import { memo } from "react";
import { Button } from "@/components/ui/button";

interface ConfigHeaderProps {
  isSaving?: boolean;
  onSave?: () => void;
  onReset?: () => void;
}

export const ConfigHeader = memo(({ isSaving = false, onSave, onReset }: ConfigHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">AI Configuration</h1>
        <p className="text-gray-600">Customize AI behavior and response patterns</p>
      </div>
      <div className="flex space-x-2">
        {onReset && (
          <Button 
            onClick={onReset} 
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Reset to Defaults
          </Button>
        )}
        {onSave && (
          <Button 
            onClick={onSave} 
            disabled={isSaving} 
            className="bg-pink-600 hover:bg-pink-700"
          >
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </Button>
        )}
      </div>
    </div>
  );
});

ConfigHeader.displayName = 'ConfigHeader';
