
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { RotateCcw, Brain, MessageSquare, Mic, Shield } from "lucide-react";

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

  const resetButtons = [
    {
      section: 'aiProvider',
      name: 'AI Provider',
      icon: Brain,
      tooltip: 'Reset AI Provider settings'
    },
    {
      section: 'responseStyle',
      name: 'Response Style',
      icon: MessageSquare,
      tooltip: 'Reset Response Style settings'
    },
    {
      section: 'audio',
      name: 'Audio',
      icon: Mic,
      tooltip: 'Reset Audio settings'
    },
    {
      section: 'privacy',
      name: 'Privacy',
      icon: Shield,
      tooltip: 'Reset Privacy settings'
    }
  ];

  return (
    <TooltipProvider>
      <div className="flex gap-1">
        {resetButtons.map((button) => (
          <Tooltip key={button.section}>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => resetSection(button.section, button.name)}
                className="border-gray-200 text-gray-600 hover:bg-gray-50 px-2"
                aria-label={button.tooltip}
              >
                <button.icon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{button.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};
