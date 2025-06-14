
import { TranscriptSegment } from '@/services/speech/speechAnalytics';

export interface AudioAnalysis {
  transcript: string;
  isQuestion: boolean;
  questionType: 'behavioral' | 'technical' | 'situational' | 'general';
  confidence: number;
  speakerChange: boolean;
  urgency: 'low' | 'medium' | 'high';
}

export interface UnifiedAudioConfig {
  onTranscript: (analysis: AudioAnalysis, segments: TranscriptSegment[]) => void;
  onAnalytics: (analytics: any) => void;
  onError: (error: string) => void;
  onStatusChange: (status: 'capturing' | 'stopped' | 'error' | 'processing') => void;
}
