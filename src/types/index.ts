
export interface AISuggestion {
  text: string;
  framework: string;
  confidence: number;
}

export interface AIResponse {
  suggestion: string;
  confidence: number;
  framework?: string;
  reasoning?: string;
}

export interface TranscriptSegment {
  id: string;
  text: string;
  timestamp: number;
  confidence: number;
  isFinal: boolean;
}

export interface SpeechAnalytics {
  wordsPerMinute: number;
  averageConfidence: number;
  totalWords: number;
  sessionDuration: number;
}
