
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { FileText, Zap, Shield, Mic, Brain } from "lucide-react";

interface ConfigTemplatesProps {
  onApplyTemplate: (settings: any) => void;
}

export const ConfigTemplates = ({ onApplyTemplate }: ConfigTemplatesProps) => {
  const { toast } = useToast();

  const templates = [
    {
      id: "beginner",
      name: "Beginner Friendly",
      description: "Conservative settings with detailed guidance",
      icon: <FileText className="h-5 w-5" />,
      settings: {
        aiProvider: { primary: "openai", models: { openai: 'gpt-4o-mini' } },
        responseStyle: { tone: "conversational", length: "detailed" },
        coaching: { enableRealtime: true },
        audio: { noiseReduction: true }
      }
    },
    {
      id: "performance",
      name: "High Performance",
      description: "Optimized for speed and efficiency",
      icon: <Zap className="h-5 w-5" />,
      settings: {
        aiProvider: { primary: "openai", models: { openai: 'gpt-4o' } },
        responseStyle: { tone: "professional", length: "brief" },
        coaching: { enableRealtime: true },
        audio: { noiseReduction: false }
      }
    },
    {
      id: "privacy",
      name: "Privacy Focused",
      description: "Maximum privacy and local processing",
      icon: <Shield className="h-5 w-5" />,
      settings: {
        aiProvider: { primary: "openai" },
        responseStyle: { tone: "professional", length: "medium" },
        analytics: { enableTracking: false },
        privacy: { localDataProcessing: true }
      }
    },
    {
      id: "audio-focused",
      name: "Audio Specialist",
      description: "Optimized for speech analysis and feedback",
      icon: <Mic className="h-5 w-5" />,
      settings: {
        aiProvider: { primary: "openai" },
        responseStyle: { tone: "technical", length: "detailed" },
        audio: { noiseReduction: true, autoGainControl: true },
        coaching: { enableRealtime: true }
      }
    },
    {
      id: "ai-power",
      name: "AI Power User",
      description: "Advanced settings for AI enthusiasts",
      icon: <Brain className="h-5 w-5" />,
      settings: {
        aiProvider: { primary: "claude", models: { claude: 'claude-3-opus-20240229' } },
        responseStyle: { tone: "technical", length: "comprehensive" },
        coaching: { enableRealtime: true },
        analytics: { enableTracking: true }
      }
    }
  ];

  const applyTemplate = (template: any) => {
    onApplyTemplate(template.settings);
    toast({
      title: "Template Applied",
      description: `${template.name} configuration has been applied.`,
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="border-pink-200 text-pink-600 hover:bg-pink-50"
        >
          <FileText className="h-4 w-4 mr-2" />
          Templates
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Configuration Templates</h3>
          <p className="text-sm text-gray-500 mb-4">
            Quick setup presets for common use cases
          </p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {templates.map((template) => (
              <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="text-pink-600">{template.icon}</div>
                      <CardTitle className="text-sm">{template.name}</CardTitle>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => applyTemplate(template)}
                      className="h-6 px-2 text-xs"
                    >
                      Apply
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-xs">
                    {template.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
