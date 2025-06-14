
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

export interface Settings {
  audioSettings: AudioSettings;
  responseSettings: ResponseSettings;
  privacySettings: PrivacySettings;
  aiConfig: AIConfig;
  screenshotHistory?: ScreenshotAnalysis[];
}

export interface ScreenshotAnalysis {
  insights: string;
  confidence: number;
  questions: string[];
  keyPoints: string[];
  actionItems: string[];
  timestamp: number;
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

// Add missing types for backward compatibility
export interface SessionData {
  id: string;
  date: string;
  analytics: any;
  performance: any;
  duration?: number;
  transcript?: string;
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
