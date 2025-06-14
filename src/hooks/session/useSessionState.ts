
import { useState, useRef } from 'react';
import { OptimizedSessionState } from './sessionTypes';
import { TranscriptSegment } from '@/services/speech/speechAnalytics';

export const useSessionState = () => {
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

  return {
    sessionState,
    setSessionState,
    transcriptRef,
    segmentsRef,
    lastQuestionTimeRef
  };
};
