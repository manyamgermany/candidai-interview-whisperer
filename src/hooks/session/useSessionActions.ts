
import { useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { unifiedAudioService, UnifiedAudioService } from '@/services/unifiedAudioService';
import { OptimizedSessionState, SessionCallbacks } from './sessionTypes';

interface UseSessionActionsProps {
  sessionState: OptimizedSessionState;
  setSessionState: React.Dispatch<React.SetStateAction<OptimizedSessionState>>;
  transcriptRef: React.MutableRefObject<string>;
  segmentsRef: React.MutableRefObject<any[]>;
  lastQuestionTimeRef: React.MutableRefObject<number>;
  callbacks: SessionCallbacks;
}

export const useSessionActions = ({
  sessionState,
  setSessionState,
  transcriptRef,
  segmentsRef,
  lastQuestionTimeRef,
  callbacks
}: UseSessionActionsProps) => {
  const { toast } = useToast();

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
  }, [setSessionState, toast]);

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
    clearTranscript,
    dismissSuggestion,
    clearError
  };
};
