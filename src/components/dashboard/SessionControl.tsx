
import { memo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic } from "lucide-react";
import { useSessionManager } from "@/hooks/useSessionManager";
import { SessionActions } from "./SessionActions";
import { SessionStatus } from "./SessionStatus";
import { AIFeaturesIndicator } from "./AIFeaturesIndicator";
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
          AI-powered meeting assistance with personalized suggestions and performance analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <SessionActions
              sessionActive={sessionActive}
              isRecording={isRecording}
              isGeneratingReport={isGeneratingReport}
              onStartSession={handleStartSession}
              onToggleRecording={toggleRecording}
            />
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
