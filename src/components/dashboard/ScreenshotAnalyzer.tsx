
import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Camera } from "lucide-react";
import { screenshotAnalysisService } from "@/services/screenshotAnalysisService";
import { useToast } from "@/hooks/use-toast";

interface ScreenshotAnalyzerProps {
  onAnalysisComplete?: (analysis: any) => void;
  className?: string;
}

export const ScreenshotAnalyzer = memo(({ onAnalysisComplete, className }: ScreenshotAnalyzerProps) => {
  const { toast } = useToast();

  const handleScreenshotAnalysis = async () => {
    try {
      toast({
        title: "Capturing Screenshot",
        description: "Analyzing screen content...",
      });

      const analysis = await screenshotAnalysisService.captureAndAnalyze();
      
      if (analysis) {
        onAnalysisComplete?.(analysis);

        toast({
          title: "Analysis Complete",
          description: "Screen analysis is ready with insights and suggestions",
        });
      }
    } catch (error) {
      console.error('Screenshot analysis failed:', error);
      
      let errorMessage = "Unable to analyze screenshot.";
      if (error instanceof Error && error.message.includes('permission')) {
        errorMessage = "Screen capture permission was denied. Please allow screen sharing and try again.";
      } else if (error instanceof Error && error.message.includes('not allowed')) {
        errorMessage = "Screen capture is not allowed. Please check browser permissions.";
      }
      
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="lg"
            onClick={handleScreenshotAnalysis}
            className={`h-12 w-12 p-0 ${className || "border-blue-200 text-blue-600 hover:bg-blue-50"}`}
          >
            <Camera className="h-6 w-6" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <div className="font-medium">Smart Screen Analyzer</div>
            <div className="text-xs text-muted-foreground">
              Capture and analyze any screen content using AI vision
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Perfect for exams, presentations, and quick insights
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

ScreenshotAnalyzer.displayName = 'ScreenshotAnalyzer';
