
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { RotateCcw } from "lucide-react";

interface SectionResetButtonsProps {
  onResetSection: (section: string) => void;
}

export const SectionResetButtons = ({ onResetSection }: SectionResetButtonsProps) => {
  const { toast } = useToast();

  const resetSection = (section: string, sectionName: string) => {
    onResetSection(section);
    toast({
      title: "Section Reset",
      description: `${sectionName} settings have been reset to defaults.`,
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => resetSection('aiProvider', 'AI Provider')}
        className="border-gray-200 text-gray-600 hover:bg-gray-50"
      >
        <RotateCcw className="h-3 w-3 mr-1" />
        Reset AI
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => resetSection('responseStyle', 'Response Style')}
        className="border-gray-200 text-gray-600 hover:bg-gray-50"
      >
        <RotateCcw className="h-3 w-3 mr-1" />
        Reset Response
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => resetSection('audio', 'Audio')}
        className="border-gray-200 text-gray-600 hover:bg-gray-50"
      >
        <RotateCcw className="h-3 w-3 mr-1" />
        Reset Audio
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => resetSection('privacy', 'Privacy')}
        className="border-gray-200 text-gray-600 hover:bg-gray-50"
      >
        <RotateCcw className="h-3 w-3 mr-1" />
        Reset Privacy
      </Button>
    </div>
  );
};
