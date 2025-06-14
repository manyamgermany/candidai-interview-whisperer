
import { useState, useEffect, useCallback } from 'react';
import { speechService } from "@/services/speech/speechService";
import { aiService } from "@/services/aiService";
import { chromeStorage } from "@/utils/chromeStorage";
import { SpeechAnalytics } from "@/services/speech/speechAnalytics";
import { PerformanceReport } from "@/types/interviewTypes";

interface UseSessionManagerProps {
  onSessionChange: (active: boolean) => void;
  onTranscriptChange: (transcript: string) => void;
  onAnalyticsChange: (analytics: SpeechAnalytics) => void;
  onAISuggestionChange: (suggestion: any) => void;
  onPerformanceReportGenerated?: (report: PerformanceReport) => void;
}

export const useSessionManager = ({
  onSessionChange,
  onTranscriptChange,
  onAnalyticsChange,
  onAISuggestionChange,
  onPerformanceReportGenerated
}: UseSessionManagerProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionDuration, setSessionDuration] = useState("00:00");
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  const [currentAnalytics, setCurrentAnalytics] = useState<SpeechAnalytics>({
    wordsPerMinute: 0,
    fillerWords: 0,
    confidenceScore: 0,
    pauseDuration: 0,
    totalWords: 0,
    speakingTime: 0
  });
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [transcriptSegments, setTranscriptSegments] = useState<any[]>([]);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Update session duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (sessionActive) {
      interval = setInterval(() => {
        const elapsed = Date.now() - sessionStartTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        setSessionDuration(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionActive, sessionStartTime]);

  const generateAISuggestion = useCallback(async (text: string) => {
    try {
      const suggestion = await aiService.generateSuggestion(text, 'behavioral', 'star');
      onAISuggestionChange(suggestion);
    } catch (error) {
      console.error('AI suggestion error:', error);
    }
  }, [onAISuggestionChange]);

  const generatePerformanceReport = useCallback(async () => {
    if (!currentTranscript || transcriptSegments.length === 0) {
      console.warn('No transcript data available for performance report');
      return;
    }

    setIsGeneratingReport(true);
    try {
      const sessionId = Date.now().toString();
      const durationInMinutes = (Date.now() - sessionStartTime) / 60000;

      const report = await aiService.generatePerformanceReport(
        currentTranscript,
        currentAnalytics,
        transcriptSegments,
        durationInMinutes,
        sessionId
      );

      onPerformanceReportGenerated?.(report);
      
      const sessionData = {
        id: sessionId,
        timestamp: Date.now(),
        platform: "Live Meeting",
        duration: durationInMinutes,
        transcript: currentTranscript,
        analytics: currentAnalytics,
        suggestions: [],
        performanceReport: report
      };
      
      await chromeStorage.saveSession(sessionData);
    } catch (error) {
      console.error('Error generating performance report:', error);
    } finally {
      setIsGeneratingReport(false);
    }
  }, [currentTranscript, transcriptSegments, sessionStartTime, currentAnalytics, onPerformanceReportGenerated]);

  const handleStartSession = useCallback(async () => {
    if (!sessionActive) {
      setSessionActive(true);
      setIsRecording(true);
      setSessionStartTime(Date.now());
      onSessionChange(true);
      
      const settings = await chromeStorage.getSettings();
      if (settings.aiProvider.openaiKey) {
        await aiService.configure('openai', settings.aiProvider.openaiKey);
      }

      speechService.startListening({
        onTranscript: (text, segments) => {
          setCurrentTranscript(text);
          setTranscriptSegments(segments);
          onTranscriptChange(text);
          const recentText = text.split(' ').slice(-20).join(' ');
          if (recentText.length > 10) {
            generateAISuggestion(recentText);
          }
        },
        onAnalytics: (newAnalytics) => {
          setCurrentAnalytics(newAnalytics);
          onAnalyticsChange(newAnalytics);
        },
        onError: (error) => {
          console.error('Speech recognition error:', error);
        }
      });
    } else {
      await generatePerformanceReport();
      setSessionActive(false);
      setIsRecording(false);
      onSessionChange(false);
      speechService.stopListening();
    }
  }, [sessionActive, onSessionChange, onTranscriptChange, onAnalyticsChange, generateAISuggestion, generatePerformanceReport]);

  const toggleRecording = useCallback(() => {
    if (sessionActive) {
      if (isRecording) {
        speechService.stopListening();
      } else {
        speechService.startListening({
          onTranscript: (text, segments) => {
            setCurrentTranscript(text);
            setTranscriptSegments(segments);
            onTranscriptChange(text);
          },
          onAnalytics: (newAnalytics) => {
            setCurrentAnalytics(newAnalytics);
            onAnalyticsChange(newAnalytics);
          }
        });
      }
      setIsRecording(!isRecording);
    }
  }, [sessionActive, isRecording, onTranscriptChange, onAnalyticsChange]);

  return {
    isRecording,
    sessionActive,
    sessionDuration,
    isGeneratingReport,
    handleStartSession,
    toggleRecording
  };
};
