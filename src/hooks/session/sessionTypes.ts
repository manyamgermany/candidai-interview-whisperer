
import { SpeechAnalytics, TranscriptSegment } from '@/services/speech/speechAnalytics';
import { AudioAnalysis } from '@/services/unifiedAudioService';
import { AISuggestion } from '@/services/aiSuggestionService';

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
  sessionStartTime: number;
  sessionDuration: string;
}

export interface SessionCallbacks {
  onTranscript: (analysis: AudioAnalysis, segments: TranscriptSegment[]) => void;
  onAnalytics: (analytics: SpeechAnalytics) => void;
  onError: (error: string) => void;
  onStatusChange: (status: 'capturing' | 'stopped' | 'error' | 'processing') => void;
}
