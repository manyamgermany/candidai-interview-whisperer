
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

// Re-export for compatibility
export { SpeechAnalytics as default };
