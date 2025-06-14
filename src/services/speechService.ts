
export interface SpeechAnalytics {
  wordsPerMinute: number;
  fillerWords: number;
  pauseDuration: number;
  confidenceScore: number;
  totalWords: number;
  speakingTime: number;
}

export interface TranscriptSegment {
  id: string;
  text: string;
  timestamp: number;
  confidence: number;
  speaker?: string;
}

// Re-export for compatibility - use 'export type' for types
export type { SpeechAnalytics as default };
