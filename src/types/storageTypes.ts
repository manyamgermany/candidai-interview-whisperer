
export interface AIConfig {
  provider: 'openai' | 'anthropic' | 'fallback';
  model: string;
  temperature: number;
  maxTokens: number;
  industryFocus: string;
  responseStyle: 'concise' | 'detailed' | 'balanced';
  enablePersonalization: boolean;
  enableIndustryModels: boolean;
}

export interface SessionData {
  id: string;
  date: number;
  duration: number;
  transcript: string;
  analytics: {
    wordsPerMinute: number;
    fillerWords: number;
    confidenceScore: number;
    totalWords: number;
  };
  performance: {
    score: number;
    strengths: string[];
    improvements: string[];
  };
  type: 'practice' | 'real' | 'simulation';
}

export interface StorageSettings {
  aiConfig: AIConfig;
  audioSettings: {
    microphoneEnabled: boolean;
    noiseReduction: boolean;
    autoGainControl: boolean;
  };
  privacySettings: {
    storeTranscripts: boolean;
    shareAnalytics: boolean;
    autoDelete: boolean;
  };
}
