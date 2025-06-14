
export interface AISuggestion {
  id: string;
  suggestion: string;
  confidence: number;
  type: 'answer' | 'clarification' | 'follow-up' | 'screenshot-analysis';
  timestamp: number;
  context: string;
  framework?: string;
  reasoning?: string;
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
  fillerWords: number;
  pauseDuration: number;
  confidenceScore: number;
  speakingTime: number;
}
