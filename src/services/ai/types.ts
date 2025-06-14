
export interface AIResponse {
  suggestion: string;
  confidence: number;
  framework?: string;
  reasoning?: string;
}

export interface AIProvider {
  name: string;
  apiKey: string;
  endpoint: string;
  model: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}
