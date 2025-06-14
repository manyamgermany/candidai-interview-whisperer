
export interface AISuggestion {
  id: string;
  suggestion: string;
  confidence: number;
  type: 'answer' | 'clarification' | 'follow-up';
  timestamp: number;
  context: string;
}

export interface SuggestionContext {
  analysis: any;
  recentTranscript: string;
  userDocuments: any[];
  contextWindow: number;
}
