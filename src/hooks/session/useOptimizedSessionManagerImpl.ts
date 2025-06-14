
import { useSessionState } from './useSessionState';
import { useSessionCallbacks } from './useSessionCallbacks';
import { useSessionActions } from './useSessionActions';
import { UnifiedAudioService } from '@/services/unifiedAudioService';

export const useOptimizedSessionManager = () => {
  const {
    sessionState,
    setSessionState,
    transcriptRef,
    segmentsRef,
    lastQuestionTimeRef
  } = useSessionState();

  const callbacks = useSessionCallbacks({
    sessionState,
    setSessionState,
    transcriptRef,
    segmentsRef,
    lastQuestionTimeRef
  });

  const actions = useSessionActions({
    sessionState,
    setSessionState,
    transcriptRef,
    segmentsRef,
    lastQuestionTimeRef,
    callbacks
  });

  return {
    sessionState,
    ...actions,
    
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
