
export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  linkedin?: string;
  github?: string;
  location?: string;
}

export interface Skills {
  technical: string[];
  soft: string[];
}

export interface Experience {
  title: string;
  company: string;
  duration: string;
  highlights: string[];
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
  gpa?: string;
}

export interface Project {
  name: string;
  description: string;
  role: string;
  duration: string;
  url?: string;
  technologies: string[];
  achievements: string[];
}

export type ExperienceLevel = "entry" | "mid" | "senior" | "executive";

export interface ProfileData {
  personalInfo: PersonalInfo;
  professionalSummary: string;
  targetRole: string;
  experienceLevel: ExperienceLevel;
  skills: Skills;
  experience: Experience[];
  education: Education[];
  certifications: string[];
  projects: Project[];
}
