import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { unifiedAudioService, UnifiedAudioService } from '@/services/unifiedAudioService';
import { OptimizedSessionState, SessionCallbacks } from './sessionTypes';
import { aiService } from "@/services/aiService";
import { chromeStorage } from "@/utils/chromeStorage";
import { PerformanceReport } from "@/types/interviewTypes";
import { TranscriptSegment } from '@/services/speech/speechAnalytics';
import { AISuggestion } from '@/services/aiSuggestionService';

interface UseSessionActionsProps {
  sessionState: OptimizedSessionState;
  setSessionState: React.Dispatch<React.SetStateAction<OptimizedSessionState>>;
  transcriptRef: React.MutableRefObject<string>;
  segmentsRef: React.MutableRefObject<TranscriptSegment[]>;
  lastQuestionTimeRef: React.MutableRefObject<number>;
  callbacks: SessionCallbacks;
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
      callbacks.onError('Speech recognition not supported in this browser');
      return false;
    }

    try {
      const success = await unifiedAudioService.startCapturing(callbacks);

      if (success) {
        setSessionState(prev => ({
          ...prev,
          isActive: true,
          isRecording: true,
          status: 'capturing',
          errorMessage: null,
          transcript: '',
          segments: [],
          currentSuggestion: null,
          sessionStartTime: Date.now(),
          sessionDuration: '00:00',
        }));

        // Reset refs
        transcriptRef.current = '';
        segmentsRef.current = [];
        lastQuestionTimeRef.current = 0;

        toast({
          title: "Session Started",
          description: "Audio capture is now active",
        });

        return true;
      }
      
      return false;
    } catch (error) {
      callbacks.onError(`Failed to start session: ${error}`);
      return false;
    }
  }, [callbacks, setSessionState, transcriptRef, segmentsRef, lastQuestionTimeRef, toast]);

  const generatePerformanceReport = useCallback(async () => {
    if (!transcriptRef.current || segmentsRef.current.length === 0) {
      console.warn('No transcript data available for performance report');
      return;
    }

    setIsGeneratingReport(true);
    toast({ title: "Analyzing performance...", description: "Please wait while we generate your report." });

    try {
      const sessionId = Date.now().toString();
      const durationInMinutes = (Date.now() - sessionState.sessionStartTime) / 60000;

      if (!sessionState.analytics) {
        throw new Error("Analytics data is not available.");
      }

      const report = await aiService.generatePerformanceReport(
        transcriptRef.current,
        sessionState.analytics,
        segmentsRef.current,
        durationInMinutes,
        sessionId
      );

      onPerformanceReportGenerated?.(report);
      
      const sessionData = {
        id: sessionId,
        timestamp: Date.now(),
        platform: "Live Meeting",
        duration: durationInMinutes,
        transcript: transcriptRef.current,
        analytics: sessionState.analytics,
        suggestions: [],
        performanceReport: report
      };
      
      await chromeStorage.saveSession(sessionData);
      toast({ title: "Report Generated!", description: "Your performance report is ready." });

    } catch (error) {
      console.error('Error generating performance report:', error);
      toast({ title: "Report Error", description: `Failed to generate report: ${error}`, variant: "destructive" });
    } finally {
      setIsGeneratingReport(false);
    }
  }, [
    sessionState.sessionStartTime, 
    sessionState.analytics, 
    transcriptRef, 
    segmentsRef, 
    onPerformanceReportGenerated, 
    toast
  ]);

  const stopSession = useCallback(async () => {
    unifiedAudioService.stopCapturing();
    
    await generatePerformanceReport();
    
    setSessionState(prev => ({
      ...prev,
      isActive: false,
      isRecording: false,
      status: 'idle'
    }));

    toast({
      title: "Session Stopped",
      description: "Audio capture has been stopped",
    });
  }, [setSessionState, toast, generatePerformanceReport]);

  const toggleRecording = useCallback(() => {
    if (!sessionState.isActive) return;

    if (sessionState.isRecording) {
      unifiedAudioService.pauseListening();
    } else {
      unifiedAudioService.resumeListening();
    }
  }, [sessionState.isActive, sessionState.isRecording]);

  const clearTranscript = useCallback(() => {
    transcriptRef.current = '';
    segmentsRef.current = [];
    
    setSessionState(prev => ({
      ...prev,
      transcript: '',
      segments: [],
      currentSuggestion: null,
      lastQuestion: null
    }));
  }, [setSessionState, transcriptRef, segmentsRef]);

  const dismissSuggestion = useCallback(() => {
    setSessionState(prev => ({
      ...prev,
      currentSuggestion: null
    }));
  }, [setSessionState]);

  const setSuggestion = useCallback((suggestion: AISuggestion) => {
    setSessionState(prev => ({
      ...prev,
      currentSuggestion: suggestion
    }));
  }, [setSessionState]);

  const clearError = useCallback(() => {
    setSessionState(prev => ({
      ...prev,
      errorMessage: null,
      status: prev.isActive ? 'capturing' : 'idle'
    }));
  }, [setSessionState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sessionState.isActive) {
        unifiedAudioService.stopCapturing();
      }
    };
  }, [sessionState.isActive]);

  return {
    startSession,
    stopSession,
    toggleRecording,
    isGeneratingReport,
    clearTranscript,
    dismissSuggestion,
    setSuggestion,
    clearError
  };
};
