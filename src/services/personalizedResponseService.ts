import { UserProfile, JobDescription, UserProject, InterviewType, IndustryType } from '@/types/interviewTypes';
import { IndustrySpecificModels } from './ai/industryModels';
import { AIResponse } from './ai/types';

export class PersonalizedResponseService {
  private userProfile: UserProfile | null = null;

  setUserProfile(profile: UserProfile) {
    this.userProfile = profile;
    this.saveProfileToStorage(profile);
  }

  getUserProfile(): UserProfile | null {
    if (!this.userProfile) {
      this.userProfile = this.loadProfileFromStorage();
    }
    return this.userProfile;
  }

  generatePersonalizedResponse(
    context: string,
    questionType: string,
    framework: string
  ): string {
    const profile = this.getUserProfile();
    if (!profile) {
      return this.buildGenericPrompt(context, questionType, framework);
    }

    const industryPrompt = IndustrySpecificModels.buildIndustrySpecificPrompt(
      profile.targetIndustry as IndustryType,
      profile.interviewType,
      this.buildPersonalizedPrompt(context, questionType, framework, profile)
    );

    return industryPrompt;
  }

  private buildPersonalizedPrompt(
    context: string,
    questionType: string,
    framework: string,
    profile: UserProfile
  ): string {
    const personalContext = this.buildPersonalContext(profile);
    const projectContext = this.buildProjectContext(profile.projects);
    const jobContext = this.buildJobContext(profile.jobDescription);
    const keywordContext = this.buildKeywordContext(profile.focusKeywords);

    return `You are providing personalized interview assistance to ${profile.personalInfo.name}.

PERSONAL CONTEXT:
${personalContext}

PROJECT EXPERIENCE:
${projectContext}

TARGET ROLE CONTEXT:
${jobContext}

FOCUS KEYWORDS TO EMPHASIZE:
${keywordContext}

CURRENT QUESTION CONTEXT: "${context}"
QUESTION TYPE: ${questionType}
RECOMMENDED FRAMEWORK: ${framework}

Provide a highly personalized suggestion (1-2 sentences) that:
1. Leverages their specific experience and projects
2. Incorporates relevant focus keywords naturally
3. Aligns with the target role requirements
4. Uses the ${framework} framework structure
5. Draws from their actual achievements and skills
6. Considers the ${profile.targetIndustry} industry context

Make the suggestion specific to their background and immediately actionable.`;
  }

  private buildPersonalContext(profile: UserProfile): string {
    const { personalInfo } = profile;
    return `
- Current Role: ${personalInfo.currentRole}
- Industry: ${personalInfo.industry}
- Experience Level: ${personalInfo.experience}
- Target Industry: ${profile.targetIndustry}
- Interview Type: ${profile.interviewType}`;
  }

  private buildProjectContext(projects: UserProject[]): string {
    if (!projects.length) return "No specific projects available.";

    return projects.slice(0, 3).map(project => `
- ${project.name}: ${project.description}
  Technologies: ${project.technologies.join(', ')}
  Role: ${project.role}
  Key Achievements: ${project.achievements.join('; ')}
  Duration: ${project.duration}`).join('\n');
  }

  private buildJobContext(jobDescription?: JobDescription): string {
    if (!jobDescription) return "No specific job description available.";

    return `
TARGET ROLE: ${jobDescription.title} at ${jobDescription.company}
Industry: ${jobDescription.industry}
Key Requirements: ${jobDescription.requirements.slice(0, 5).join(', ')}
Required Skills: ${jobDescription.skills.slice(0, 5).join(', ')}
Experience: ${jobDescription.experience}`;
  }

  private buildKeywordContext(keywords: string[]): string {
    if (!keywords.length) return "No specific focus keywords.";
    return keywords.join(', ');
  }

  private buildGenericPrompt(context: string, questionType: string, framework: string): string {
    return `Context: "${context}"
Question Type: ${questionType}
Framework: ${framework}

Provide a concise, actionable suggestion for responding to this interview question using the ${framework} method.`;
  }

  updateProjects(projects: UserProject[]) {
    if (this.userProfile) {
      this.userProfile.projects = projects;
      this.saveProfileToStorage(this.userProfile);
    }
  }

  updateJobDescription(jobDescription: JobDescription) {
    if (this.userProfile) {
      this.userProfile.jobDescription = jobDescription;
      this.saveProfileToStorage(this.userProfile);
    }
  }

  updateFocusKeywords(keywords: string[]) {
    if (this.userProfile) {
      this.userProfile.focusKeywords = keywords;
      this.saveProfileToStorage(this.userProfile);
    }
  }

  updateInterviewType(interviewType: InterviewType) {
    if (this.userProfile) {
      this.userProfile.interviewType = interviewType;
      this.saveProfileToStorage(this.userProfile);
    }
  }

  updateTargetIndustry(industry: IndustryType) {
    if (this.userProfile) {
      this.userProfile.targetIndustry = industry;
      this.saveProfileToStorage(this.userProfile);
    }
  }

  private saveProfileToStorage(profile: UserProfile) {
    try {
      localStorage.setItem('candidai_user_profile', JSON.stringify(profile));
    } catch (error) {
      console.error('Failed to save user profile:', error);
    }
  }

  private loadProfileFromStorage(): UserProfile | null {
    try {
      const stored = localStorage.getItem('candidai_user_profile');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to load user profile:', error);
      return null;
    }
  }

  // Method to extract user profile from processed documents
  createProfileFromDocument(documentAnalysis: any): Partial<UserProfile> {
    return {
      personalInfo: {
        name: documentAnalysis.personalInfo?.name || '',
        currentRole: documentAnalysis.experience?.[0]?.title || '',
        experience: this.calculateExperienceLevel(documentAnalysis.experience || []),
        industry: this.inferIndustryFromExperience(documentAnalysis.experience || [])
      },
      focusKeywords: [
        ...(documentAnalysis.skills?.technical?.slice(0, 5) || []),
        ...(documentAnalysis.skills?.soft?.slice(0, 3) || [])
      ],
      projects: this.extractProjectsFromExperience(documentAnalysis.experience || []),
      targetIndustry: 'general',
      interviewType: 'general'
    };
  }

  private calculateExperienceLevel(experience: any[]): string {
    const totalYears = experience.reduce((total, exp) => {
      const duration = exp.duration || '';
      const years = this.extractYearsFromDuration(duration);
      return total + years;
    }, 0);

    if (totalYears < 2) return 'Entry Level (0-2 years)';
    if (totalYears < 5) return 'Mid Level (2-5 years)';
    if (totalYears < 10) return 'Senior Level (5-10 years)';
    return 'Executive Level (10+ years)';
  }

  private extractYearsFromDuration(duration: string): number {
    const yearMatch = duration.match(/(\d+)\s*year/i);
    const monthMatch = duration.match(/(\d+)\s*month/i);
    
    let years = yearMatch ? parseInt(yearMatch[1]) : 0;
    const months = monthMatch ? parseInt(monthMatch[1]) : 0;
    
    return years + (months / 12);
  }

  private inferIndustryFromExperience(experience: any[]): string {
    const companies = experience.map(exp => exp.company?.toLowerCase() || '').join(' ');
    const titles = experience.map(exp => exp.title?.toLowerCase() || '').join(' ');
    const combined = companies + ' ' + titles;

    if (combined.includes('tech') || combined.includes('software') || combined.includes('developer')) return 'technology';
    if (combined.includes('finance') || combined.includes('bank') || combined.includes('investment')) return 'finance';
    if (combined.includes('consult') || combined.includes('advisory')) return 'consulting';
    if (combined.includes('health') || combined.includes('medical') || combined.includes('hospital')) return 'healthcare';
    if (combined.includes('market') || combined.includes('brand') || combined.includes('advertising')) return 'marketing';
    if (combined.includes('sales') || combined.includes('account') || combined.includes('business development')) return 'sales';
    
    return 'general';
  }

  private extractProjectsFromExperience(experience: any[]): UserProject[] {
    return experience.slice(0, 3).map((exp, index) => ({
      id: `exp-${index}`,
      name: exp.title || `Project ${index + 1}`,
      description: exp.highlights?.[0] || 'Professional experience project',
      technologies: this.extractTechnologiesFromHighlights(exp.highlights || []),
      role: exp.title || 'Team Member',
      achievements: exp.highlights?.slice(0, 3) || [],
      duration: exp.duration || 'Not specified',
      url: ''
    }));
  }

  private extractTechnologiesFromHighlights(highlights: string[]): string[] {
    const techKeywords = ['JavaScript', 'Python', 'Java', 'React', 'Angular', 'Node.js', 'SQL', 'AWS', 'Docker'];
    const found: string[] = [];
    
    highlights.forEach(highlight => {
      techKeywords.forEach(tech => {
        if (highlight.toLowerCase().includes(tech.toLowerCase()) && !found.includes(tech)) {
          found.push(tech);
        }
      });
    });
    
    return found;
  }
}

export const personalizedResponseService = new PersonalizedResponseService();
