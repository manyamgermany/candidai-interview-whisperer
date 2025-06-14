
import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Mic, MicOff, Play, Pause, BarChart3 } from "lucide-react";
import { OptimizedSessionState } from "@/hooks/useOptimizedSessionManager";
import { SessionStatus } from "./SessionStatus";
import { AIFeaturesIndicator } from "./AIFeaturesIndicator";
import { ScreenshotAnalyzer } from "./ScreenshotAnalyzer";
import { AISuggestion } from "@/services/aiSuggestionService";

interface SessionControlProps {
  sessionState: OptimizedSessionState;
  startSession: () => void;
  stopSession: () => void;
  toggleRecording: () => void;
  isGeneratingReport: boolean;
  onAISuggestionChange: (suggestion: AISuggestion) => void;
}

export const SessionControl = memo(({
  sessionState,
  startSession,
  stopSession,
  toggleRecording,
  isGeneratingReport,
  onAISuggestionChange
}: SessionControlProps) => {

  const handleMainButtonClick = () => {
    if (sessionState.isActive) {
      stopSession();
    } else {
      startSession();
    }
  };

  const handleScreenshotAnalysis = (analysis: any) => {
    onAISuggestionChange({
      text: analysis.insights,
      confidence: analysis.confidence,
      framework: 'visual-analysis',
      type: 'screenshot-analysis',
      priority: 'medium',
      id: Date.now().toString()
    });
  };

  return (
    <Card className="border-pink-100 shadow-sm">
      <CardContent className="py-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      size="lg" 
                      onClick={handleMainButtonClick} 
                      disabled={isGeneratingReport} 
                      className={`${
                        sessionState.isActive 
                          ? "bg-red-500 hover:bg-red-600" 
                          : "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                      } text-white h-12 w-12 p-0`}
                    >
                      {isGeneratingReport ? (
                        <BarChart3 className="h-6 w-6 animate-pulse" />
                      ) : sessionState.isActive ? (
                        <Pause className="h-6 w-6" />
                      ) : (
                        <Play className="h-6 w-6" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isGeneratingReport 
                      ? "Generating performance report..." 
                      : sessionState.isActive 
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
                      size="lg" 
                      onClick={toggleRecording} 
                      disabled={!sessionState.isActive} 
                      className={`${
                        sessionState.isRecording 
                          ? "bg-red-500 hover:bg-red-600" 
                          : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                      } text-white h-12 w-12 p-0 disabled:opacity-50`}
                    >
                      {sessionState.isRecording ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {sessionState.isRecording ? "Mute microphone" : "Unmute microphone"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <ScreenshotAnalyzer 
                onAnalysisComplete={handleScreenshotAnalysis} 
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-none" 
              />
            </div>
            
            <SessionStatus 
              sessionActive={sessionState.isActive} 
              sessionDuration={sessionState.sessionDuration} 
              isRecording={sessionState.isRecording} 
            />
          </div>
          
          <AIFeaturesIndicator sessionActive={sessionState.isActive} />
        </div>
      </CardContent>
    </Card>
  );
});

SessionControl.displayName = 'SessionControl';
