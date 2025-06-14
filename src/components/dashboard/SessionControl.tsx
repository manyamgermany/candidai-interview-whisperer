
import { memo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Mic, MicOff, Play, Pause, BarChart3 } from "lucide-react";
import { useSessionManager } from "@/hooks/useSessionManager";
import { SessionStatus } from "./SessionStatus";
import { AIFeaturesIndicator } from "./AIFeaturesIndicator";
import { ScreenshotAnalyzer } from "./ScreenshotAnalyzer";
import { PerformanceReport } from "@/types/interviewTypes";
import { SpeechAnalytics } from "@/services/speech/speechAnalytics";

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

  const handleScreenshotAnalysis = (analysis: any) => {
    onAISuggestionChange({
      suggestion: analysis.insights,
      confidence: analysis.confidence,
      framework: 'visual-analysis',
      type: 'screenshot-analysis'
    });
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

              <ScreenshotAnalyzer onAnalysisComplete={handleScreenshotAnalysis} />
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
