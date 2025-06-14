
export interface AudioSettings {
  inputDeviceId: string;
  outputDeviceId: string;
  volume: number;
  noiseCancellation: boolean;
}

export interface ResponseSettings {
  tone: 'professional' | 'casual' | 'friendly';
  length: 'short' | 'medium' | 'long';
  formality: 'formal' | 'informal';
}

export interface PrivacySettings {
  recordAudio: boolean;
  storeTranscripts: boolean;
  shareData: boolean;
}

export interface AIConfig {
  provider: 'openai' | 'anthropic' | 'fallback';
  model: string;
  temperature: number;
  maxTokens: number;
  industryFocus: string;
  responseStyle: string;
  enablePersonalization: boolean;
  enableIndustryModels: boolean;
}

export interface ScreenshotAnalysis {
  insights: string;
  confidence: number;
  questions: string[];
  keyPoints: string[];
  actionItems: string[];
  timestamp: number;
}

export interface Settings {
  audioSettings: AudioSettings;
  responseSettings: ResponseSettings;
  privacySettings: PrivacySettings;
  aiConfig: AIConfig;
  screenshotHistory?: ScreenshotAnalysis[];
}

export type IndustryType = 'technology' | 'finance' | 'consulting' | 'healthcare' | 'marketing' | 'sales' | 'general';
export type InterviewType = 'technical' | 'behavioral' | 'situational' | 'executive' | 'general';

export interface UserProfile {
  personalInfo: {
    name: string;
    currentRole: string;
    industry: string;
    experience: string;
  };
  focusKeywords: string[];
  projects: UserProject[];
  jobDescription?: JobDescription;
  targetIndustry: IndustryType;
  interviewType: InterviewType;
}

export interface UserProject {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  role: string;
  achievements: string[];
  duration: string;
  url: string;
}

export interface JobDescription {
  title: string;
  company: string;
  industry: string;
  requirements: string[];
  skills: string[];
  experience: string;
}

export interface PerformanceReport {
  sessionId: string;
  timestamp: number;
  interviewType: InterviewType;
  industry: IndustryType;
  duration: number;
  metrics: any;
  analytics: any;
  recommendations: string[];
  nextSteps: string[];
}

// Updated SessionData type with correct properties
export interface SessionData {
  id: string;
  date: number; // timestamp
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
  screenshotHistory?: ScreenshotAnalysis[];
}
