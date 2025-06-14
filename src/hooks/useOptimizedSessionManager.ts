import { useState, useCallback, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { unifiedAudioService, AudioAnalysis, UnifiedAudioService } from '@/services/unifiedAudioService';
import { aiSuggestionService, AISuggestion } from '@/services/aiSuggestionService';
import { SpeechAnalytics, TranscriptSegment } from '@/services/speech/speechAnalytics';

export interface OptimizedSessionState {
  isActive: boolean;
  isRecording: boolean;
  status: 'idle' | 'capturing' | 'processing' | 'error';
  transcript: string;
  segments: TranscriptSegment[];
  analytics: SpeechAnalytics | null;
  currentSuggestion: AISuggestion | null;
  lastQuestion: AudioAnalysis | null;
  confidence: number;
  errorMessage: string | null;
}

export const useOptimizedSessionManager = () => {
  const { toast } = useToast();
  
  const [sessionState, setSessionState] = useState<OptimizedSessionState>({
    isActive: false,
    isRecording: false,
    status: 'idle',
    transcript: '',
    segments: [],
    analytics: null,
    currentSuggestion: null,
    lastQuestion: null,
    confidence: 0,
    errorMessage: null
  });

  // Use refs to avoid stale closures in callbacks
  const transcriptRef = useRef('');
  const segmentsRef = useRef<TranscriptSegment[]>([]);
  const lastQuestionTimeRef = useRef(0);

  // Memoized callbacks for better performance
  const handleTranscript = useCallback((analysis: AudioAnalysis, segments: TranscriptSegment[]) => {
    const newTranscript = segments.map(s => s.text).join(' ');
    transcriptRef.current = newTranscript;
    segmentsRef.current = segments;

    setSessionState(prev => ({
      ...prev,
      transcript: newTranscript,
      segments: [...segments], // Shallow copy for immutability
      confidence: analysis.confidence,
      lastQuestion: analysis.isQuestion ? analysis : prev.lastQuestion
    }));

    // Generate AI suggestion for questions with throttling
    if (analysis.isQuestion && Date.now() - lastQuestionTimeRef.current > 2000) {
      lastQuestionTimeRef.current = Date.now();
      
      aiSuggestionService.generateSuggestion(
        analysis,
        newTranscript,
        (suggestion) => {
          setSessionState(prev => ({
            ...prev,
            currentSuggestion: suggestion
          }));
          
          toast({
            title: "AI Suggestion Ready",
            description: `${suggestion.type} suggestion available`,
            duration: 3000,
          });
        },
        (error) => {
          console.error('AI suggestion error:', error);
          setSessionState(prev => ({
            ...prev,
            errorMessage: error
          }));
        }
      );
    }
  }, [toast]);

  const handleAnalytics = useCallback((analytics: SpeechAnalytics) => {
    setSessionState(prev => ({
      ...prev,
      analytics: { ...analytics } // Shallow copy
    }));
  }, []);

  const handleError = useCallback((error: string) => {
    console.error('Session error:', error);
    setSessionState(prev => ({
      ...prev,
      status: 'error',
      errorMessage: error
    }));
    
    toast({
      title: "Session Error",
      description: error,
      variant: "destructive",
    });
  }, [toast]);

  const handleStatusChange = useCallback((status: 'capturing' | 'stopped' | 'error' | 'processing') => {
    setSessionState(prev => ({
      ...prev,
      status: status === 'stopped' ? 'idle' : status,
      isRecording: status === 'capturing'
    }));
  }, []);

  const startSession = useCallback(async () => {
    if (!UnifiedAudioService.isSupported()) {
      handleError('Speech recognition not supported in this browser');
      return false;
    }

    try {
      const success = await unifiedAudioService.startCapturing({
        onTranscript: handleTranscript,
        onAnalytics: handleAnalytics,
        onError: handleError,
        onStatusChange: handleStatusChange
      });

      if (success) {
        setSessionState(prev => ({
          ...prev,
          isActive: true,
          isRecording: true,
          status: 'capturing',
          errorMessage: null,
          transcript: '',
          segments: [],
          currentSuggestion: null
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
      handleError(`Failed to start session: ${error}`);
      return false;
    }
  }, [handleTranscript, handleAnalytics, handleError, handleStatusChange, toast]);

  const stopSession = useCallback(() => {
    unifiedAudioService.stopCapturing();
    
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
  }, [toast]);

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
  }, []);

  const dismissSuggestion = useCallback(() => {
    setSessionState(prev => ({
      ...prev,
      currentSuggestion: null
    }));
  }, []);

  const clearError = useCallback(() => {
    setSessionState(prev => ({
      ...prev,
      errorMessage: null,
      status: prev.isActive ? 'capturing' : 'idle'
    }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sessionState.isActive) {
        unifiedAudioService.stopCapturing();
      }
    };
  }, [sessionState.isActive]);

  return {
    sessionState,
    startSession,
    stopSession,
    clearTranscript,
    dismissSuggestion,
    clearError,
    
    // Computed values for UI
    isSupported: UnifiedAudioService.isSupported(),
    canStart: !sessionState.isActive && sessionState.status !== 'error',
    hasError: !!sessionState.errorMessage,
    hasActiveSuggestion: !!sessionState.currentSuggestion,
    wordCount: sessionState.transcript.split(' ').filter(w => w.length > 0).length,
    
    // Performance metrics
    averageConfidence: sessionState.segments.length > 0 
      ? sessionState.segments.reduce((sum, s) => sum + s.confidence, 0) / sessionState.segments.length 
      : 0
  };
};
