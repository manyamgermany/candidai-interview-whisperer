
export interface AIProviderSettings {
  primary: 'openai' | 'claude' | 'gemini';
  openaiKey?: string;
  claudeKey?: string;
  geminiKey?: string;
  models: {
    openai: string;
    claude: string;
    gemini: string;
  };
}

export interface ResponseStyleSettings {
  tone: 'professional' | 'casual' | 'friendly';
  length: 'short' | 'medium' | 'long';
  formality: 'formal' | 'informal';
}

export interface AudioSettings {
  inputDevice: string;
  outputDevice: string;
  noiseReduction: boolean;
  autoGainControl: boolean;
  confidenceThreshold: number;
  fillerSensitivity: number;
}

export interface CoachingSettings {
  enableRealtime: boolean;
  frameworks: string[];
  experienceLevel: 'junior' | 'mid' | 'senior';
}

export interface AnalyticsSettings {
  enableTracking: boolean;
  trackWPM: boolean;
  trackFillers: boolean;
  trackConfidence: boolean;
}

export interface PrivacySettings {
  localDataProcessing: boolean;
  sessionRecording: boolean;
}

export interface AppSettings {
  aiProvider: AIProviderSettings;
  responseStyle: ResponseStyleSettings;
  audio: AudioSettings;
  coaching: CoachingSettings;
  analytics: AnalyticsSettings;
  privacy: PrivacySettings;
}
