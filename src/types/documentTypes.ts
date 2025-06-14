
export interface DocumentAnalysis {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    linkedin?: string;
    github?: string;
    location?: string;
  };
  skills: {
    technical: string[];
    soft: string[];
  };
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    highlights: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
    gpa?: string;
  }>;
  certifications: string[];
  projects?: Array<{
    name: string;
    description: string;
    role: string;
    duration: string;
    url: string;
    technologies: string[];
    achievements: string[];
  }>;
  insights: {
    overallScore: number;
    strengths: string[];
    improvements: string[];
    matchScore: number;
    recommendations: string[];
  };
}

export interface ProcessedDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  status: 'processing' | 'completed' | 'error';
  uploadedAt: number;
  analysis?: DocumentAnalysis;
  rawText?: string;
  processingStep?: string;
}
