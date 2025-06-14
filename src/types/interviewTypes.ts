
export interface JobDescription {
  title: string;
  company: string;
  industry: string;
  requirements: string[];
  responsibilities: string[];
  skills: string[];
  experience: string;
  location?: string;
}

export interface UserProject {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  role: string;
  achievements: string[];
  duration: string;
  url?: string;
}

export interface UserProfile {
  personalInfo: {
    name: string;
    currentRole: string;
    experience: string;
    industry: string;
  };
  resume?: any;
  jobDescription?: JobDescription;
  projects: UserProject[];
  focusKeywords: string[];
  targetIndustry: string;
  interviewType: InterviewType;
}

export type InterviewType = 
  | 'technical'
  | 'behavioral'
  | 'managerial'
  | 'executive'
  | 'sales-pitch'
  | 'client-meeting'
  | 'vendor-meeting'
  | 'board-meeting'
  | 'team-meeting'
  | 'performance-review'
  | 'general';

export type IndustryType = 
  | 'technology'
  | 'finance'
  | 'consulting'
  | 'healthcare'
  | 'marketing'
  | 'sales'
  | 'operations'
  | 'product'
  | 'design'
  | 'general';

export interface PerformanceMetrics {
  communicationScore: number;
  technicalScore: number;
  leadershipScore: number;
  confidenceScore: number;
  clarityScore: number;
  responseRelevanceScore: number;
  overallScore: number;
}

export interface DetailedAnalytics {
  speakingPace: {
    wordsPerMinute: number;
    optimal: boolean;
    recommendation: string;
  };
  fillerWords: {
    count: number;
    percentage: number;
    types: string[];
    recommendation: string;
  };
  responseStructure: {
    usedFramework: boolean;
    frameworkType?: string;
    completeness: number;
    recommendation: string;
  };
  contentQuality: {
    relevance: number;
    specificity: number;
    examples: number;
    recommendation: string;
  };
  confidence: {
    level: number;
    indicators: string[];
    recommendation: string;
  };
  improvements: string[];
  strengths: string[];
}

export interface PerformanceReport {
  sessionId: string;
  timestamp: number;
  interviewType: InterviewType;
  industry: IndustryType;
  duration: number;
  metrics: PerformanceMetrics;
  analytics: DetailedAnalytics;
  recommendations: string[];
  nextSteps: string[];
}
