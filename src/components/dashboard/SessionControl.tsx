
import { memo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Mic, MicOff, Play, Pause, BarChart3, Camera } from "lucide-react";
import { useSessionManager } from "@/hooks/useSessionManager";
import { SessionStatus } from "./SessionStatus";
import { AIFeaturesIndicator } from "./AIFeaturesIndicator";
import { PerformanceReport } from "@/types/interviewTypes";
import { SpeechAnalytics } from "@/services/speech/speechAnalytics";
import { screenshotAnalysisService } from "@/services/screenshotAnalysisService";
import { useToast } from "@/hooks/use-toast";

interface SessionControlProps {
  onSessionChange: (active: boolean) => void;
  onTranscriptChange: (transcript: string) => void;
  onAnalyticsChange: (analytics: SpeechAnalytics) => void;
  onAISuggestionChange: (suggestion: any) => void;
  onPerformanceReportGenerated?: (report: PerformanceReport) => void;
}

export const SessionControl = memo(({ 
  onSessionChange, 
  onTranscriptChange, 
  onAnalyticsChange, 
  onAISuggestionChange,
  onPerformanceReportGenerated
}: SessionControlProps) => {
  const { toast } = useToast();
  const {
    isRecording,
    sessionActive,
    sessionDuration,
    isGeneratingReport,
    handleStartSession,
    toggleRecording
  } = useSessionManager({
    onSessionChange,
    onTranscriptChange,
    onAnalyticsChange,
    onAISuggestionChange,
    onPerformanceReportGenerated
  });

  const handleScreenshotAnalysis = async () => {
    try {
      toast({
        title: "Capturing Screenshot",
        description: "Analyzing meeting content...",
      });

      const analysis = await screenshotAnalysisService.captureAndAnalyze();
      
      if (analysis) {
        onAISuggestionChange({
          suggestion: analysis.insights,
          confidence: analysis.confidence,
          framework: 'visual-analysis',
          type: 'screenshot-analysis'
        });

        toast({
          title: "Analysis Complete",
          description: "Screenshot insights are ready",
        });
      }
    } catch (error) {
      console.error('Screenshot analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze screenshot. Please check your AI provider settings.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="border-pink-100">
      <CardHeader>
        <CardTitle className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-pink-100 to-rose-100 rounded-lg text-pink-600">
            <Mic className="h-5 w-5" />
          </div>
          <span>AI-Enhanced Meeting Session</span>
          {sessionActive && (
            <Badge className="bg-green-100 text-green-700 border-green-200">
              Live Session
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          AI-powered meeting assistance with visual analysis and personalized suggestions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="lg"
                      onClick={handleStartSession}
                      disabled={isGeneratingReport}
                      className={`${
                        sessionActive 
                          ? "bg-red-500 hover:bg-red-600" 
                          : "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                      } text-white h-12 w-12 p-0`}
                    >
                      {isGeneratingReport ? (
                        <BarChart3 className="h-6 w-6 animate-pulse" />
                      ) : sessionActive ? (
                        <Pause className="h-6 w-6" />
                      ) : (
                        <Play className="h-6 w-6" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isGeneratingReport 
                      ? "Generating performance report..." 
                      : sessionActive 
                        ? "End session and analyze performance" 
                        : "Start AI-powered meeting session"
                    }
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={toggleRecording}
                      disabled={!sessionActive}
                      className="border-pink-200 text-pink-600 hover:bg-pink-50 h-12 w-12 p-0"
                    >
                      {isRecording ? (
                        <MicOff className="h-5 w-5" />
                      ) : (
                        <Mic className="h-5 w-5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isRecording ? "Mute microphone" : "Unmute microphone"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={handleScreenshotAnalysis}
                      className="border-blue-200 text-blue-600 hover:bg-blue-50 h-12 w-12 p-0"
                    >
                      <Camera className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-center">
                      <div className="font-medium">Analyze Screenshot</div>
                      <div className="text-xs text-muted-foreground">
                        Capture and analyze meeting content using AI vision
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <SessionStatus
              sessionActive={sessionActive}
              sessionDuration={sessionDuration}
              isRecording={isRecording}
            />
          </div>
          <AIFeaturesIndicator sessionActive={sessionActive} />
        </div>
      </CardContent>
    </Card>
  );
});

SessionControl.displayName = 'SessionControl';
