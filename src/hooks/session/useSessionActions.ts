
import { useCallback, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { UnifiedAudioService } from '@/services/unifiedAudioService';
import { speechService } from '@/services/speech/speechService';
import { PerformanceReport } from '@/types/interviewTypes';
import { AISuggestion } from '@/services/aiSuggestionService';
import { OptimizedSessionState } from './sessionTypes';
import { TranscriptSegment } from '@/services/speech/speechAnalytics';

interface UseSessionActionsProps {
  sessionState: OptimizedSessionState;
  setSessionState: React.Dispatch<React.SetStateAction<OptimizedSessionState>>;
  transcriptRef: React.MutableRefObject<string>;
  segmentsRef: React.MutableRefObject<TranscriptSegment[]>;
  lastQuestionTimeRef: React.MutableRefObject<number>;
  callbacks: {
    onTranscript: (analysis: any, segments: TranscriptSegment[]) => void;
    onAnalytics: (analytics: any) => void;
    onError: (error: string) => void;
    onStatusChange: (status: string) => void;
  };
  onPerformanceReportGenerated?: (report: PerformanceReport) => void;
}

export const useSessionActions = ({
  sessionState,
  setSessionState,
  transcriptRef,
  segmentsRef,
  lastQuestionTimeRef,
  callbacks,
  onPerformanceReportGenerated
}: UseSessionActionsProps) => {
  const { toast } = useToast();
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const startSession = useCallback(async () => {
    if (!UnifiedAudioService.isSupported()) {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in this browser",
        variant: "destructive",
      });
      return;
    }

    try {
      const unifiedService = new UnifiedAudioService();
      const success = await unifiedService.startCapturing({
        onTranscript: callbacks.onTranscript,
        onAnalytics: callbacks.onAnalytics,
        onError: callbacks.onError,
        onStatusChange: callbacks.onStatusChange
      });

      if (success) {
        setSessionState(prev => ({
          ...prev,
          isActive: true,
          isRecording: true,
          status: 'capturing',
          sessionStartTime: Date.now(),
          errorMessage: null
        }));

        toast({
          title: "Session Started",
          description: "AI-powered meeting assistance is now active",
        });
      }
    } catch (error) {
      console.error('Failed to start session:', error);
      callbacks.onError('Failed to start audio capture');
    }
  }, [toast, setSessionState, callbacks]);

  const stopSession = useCallback(async () => {
    setIsGeneratingReport(true);
    
    try {
      // Stop audio services
      const unifiedService = new UnifiedAudioService();
      unifiedService.stopCapturing();

      // Generate performance report
      const report: PerformanceReport = {
        sessionId: `session_${Date.now()}`,
        timestamp: Date.now(),
        duration: sessionState.sessionDuration,
        analytics: sessionState.analytics || {
          wordsPerMinute: 0,
          fillerWords: 0,
          pauseDuration: 0,
          confidenceScore: 0,
          totalWords: 0,
          speakingTime: 0
        },
        transcript: transcriptRef.current,
        suggestions: sessionState.currentSuggestion ? [sessionState.currentSuggestion] : [],
        overallScore: sessionState.analytics?.confidenceScore || 0,
        strengths: [],
        improvements: []
      };

      // Add analysis to report
      if (sessionState.analytics) {
        const { wordsPerMinute, fillerWords, confidenceScore } = sessionState.analytics;
        
        if (wordsPerMinute >= 120 && wordsPerMinute <= 160) {
          report.strengths.push("Excellent speaking pace");
        }
        if (fillerWords < 5) {
          report.strengths.push("Minimal filler words");
        }
        if (confidenceScore >= 80) {
          report.strengths.push("High confidence delivery");
        }
        
        if (wordsPerMinute < 100 || wordsPerMinute > 180) {
          report.improvements.push("Adjust speaking pace for better clarity");
        }
        if (fillerWords > 10) {
          report.improvements.push("Reduce use of filler words");
        }
        if (confidenceScore < 70) {
          report.improvements.push("Work on speaking with more confidence");
        }
      }

      onPerformanceReportGenerated?.(report);

      setSessionState(prev => ({
        ...prev,
        isActive: false,
        isRecording: false,
        status: 'idle'
      }));

      toast({
        title: "Session Complete",
        description: "Performance report generated successfully",
      });

    } catch (error) {
      console.error('Error stopping session:', error);
      toast({
        title: "Error",
        description: "Failed to generate performance report",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingReport(false);
    }
  }, [sessionState, transcriptRef, setSessionState, toast, onPerformanceReportGenerated]);

  const toggleRecording = useCallback(() => {
    setSessionState(prev => ({
      ...prev,
      isRecording: !prev.isRecording
    }));

    toast({
      title: sessionState.isRecording ? "Recording Paused" : "Recording Resumed",
      description: sessionState.isRecording ? "Microphone muted" : "Microphone active",
    });
  }, [sessionState.isRecording, setSessionState, toast]);

  const setSuggestion = useCallback((suggestion: AISuggestion) => {
    setSessionState(prev => ({
      ...prev,
      currentSuggestion: suggestion
    }));
  }, [setSessionState]);

  return {
    startSession,
    stopSession,
    toggleRecording,
    setSuggestion,
    isGeneratingReport
  };
};
