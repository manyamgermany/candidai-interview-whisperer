
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AudioAnalysis } from '@/services/unifiedAudioService';
import { aiSuggestionService } from '@/services/aiSuggestionService';
import { SpeechAnalytics, TranscriptSegment } from '@/services/speech/speechAnalytics';
import { OptimizedSessionState } from './sessionTypes';

interface UseSessionCallbacksProps {
  sessionState: OptimizedSessionState;
  setSessionState: React.Dispatch<React.SetStateAction<OptimizedSessionState>>;
  transcriptRef: React.MutableRefObject<string>;
  segmentsRef: React.MutableRefObject<TranscriptSegment[]>;
  lastQuestionTimeRef: React.MutableRefObject<number>;
}

export const useSessionCallbacks = ({
  sessionState,
  setSessionState,
  transcriptRef,
  segmentsRef,
  lastQuestionTimeRef
}: UseSessionCallbacksProps) => {
  const { toast } = useToast();

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
  }, [toast, setSessionState, transcriptRef, segmentsRef, lastQuestionTimeRef]);

  const handleAnalytics = useCallback((analytics: SpeechAnalytics) => {
    setSessionState(prev => ({
      ...prev,
      analytics: { ...analytics } // Shallow copy
    }));
  }, [setSessionState]);

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
  }, [toast, setSessionState]);

  const handleStatusChange = useCallback((status: 'capturing' | 'stopped' | 'error' | 'processing') => {
    setSessionState(prev => ({
      ...prev,
      status: status === 'stopped' ? 'idle' : status,
      isRecording: status === 'capturing'
    }));
  }, [setSessionState]);

  return {
    onTranscript: handleTranscript,
    onAnalytics: handleAnalytics,
    onError: handleError,
    onStatusChange: handleStatusChange
  };
};
