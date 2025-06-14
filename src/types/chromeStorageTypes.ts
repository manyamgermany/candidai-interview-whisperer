
export interface StorageSettings {
  aiProvider: {
    primary: string;
    openaiKey?: string;
    claudeKey?: string;
    geminiKey?: string;
  };
  responseStyle: {
    tone: string;
    length: string;
    formality: string;
  };
  audio: {
    inputDevice: string;
    outputDevice: string;
    noiseReduction: boolean;
    autoGainControl: boolean;
  };
  coaching: {
    enableRealtime: boolean;
    frameworks: string[];
    experienceLevel: string;
  };
  analytics: {
    enableTracking: boolean;
    trackWPM: boolean;
    trackFillers: boolean;
    trackConfidence: boolean;
  };
}

export interface SessionData {
  id: string;
  timestamp: number;
  date: number; // For compatibility with storageTypes
  platform: string;
  type: 'practice' | 'real' | 'simulation';
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
  };
  suggestions: string[];
}

export interface StorageInfo {
  used: number;
  total: number;
}
