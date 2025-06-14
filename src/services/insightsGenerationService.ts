
import { DocumentAnalysis } from '@/types/documentTypes';

export class InsightsGenerationService {
  generateInsights(analysis: Partial<DocumentAnalysis>): DocumentAnalysis['insights'] {
    const technicalSkillCount = analysis.skills?.technical?.length || 0;
    const softSkillCount = analysis.skills?.soft?.length || 0;
    const experienceCount = analysis.experience?.length || 0;
    const educationCount = analysis.education?.length || 0;
    const certificationCount = analysis.certifications?.length || 0;
    const hasContact = !!(analysis.personalInfo?.email && analysis.personalInfo?.phone);
    
    let score = 30; // Base score
    
    if (technicalSkillCount >= 10) score += 25;
    else if (technicalSkillCount >= 7) score += 20;
    else if (technicalSkillCount >= 5) score += 15;
    else if (technicalSkillCount >= 3) score += 10;
    
    if (softSkillCount >= 7) score += 20;
    else if (softSkillCount >= 5) score += 15;
    else if (softSkillCount >= 3) score += 10;
    
    if (experienceCount >= 3) score += 20;
    else if (experienceCount >= 2) score += 15;
    else if (experienceCount >= 1) score += 10;
    
    if (hasContact) score += 10;
    if (analysis.personalInfo?.linkedin) score += 5;
    if (analysis.personalInfo?.github) score += 5;
    if (educationCount >= 1) score += 5;
    if (certificationCount >= 1) score += 5;

    const finalScore = Math.min(score, 98);

    const strengths: string[] = [];
    const improvements: string[] = [];
    const recommendations: string[] = [];

    if (technicalSkillCount >= 7) {
      strengths.push(`Comprehensive technical expertise with ${technicalSkillCount} relevant technologies`);
    } else if (technicalSkillCount >= 3) {
      strengths.push(`Good technical foundation with ${technicalSkillCount} key technologies`);
    } else {
      improvements.push('Expand technical skill set to include more industry-relevant technologies');
    }

    if (softSkillCount >= 5) {
      strengths.push(`Strong interpersonal skills with ${softSkillCount} key competencies highlighted`);
    } else {
      improvements.push('Highlight more soft skills and leadership qualities');
    }

    if (experienceCount >= 2) {
      strengths.push(`Solid professional background with ${experienceCount} documented positions`);
    } else if (experienceCount === 1) {
      improvements.push('Consider adding more detailed work history or project experience');
    } else {
      improvements.push('Add professional experience or project details');
    }

    if (hasContact) {
      strengths.push('Complete professional contact information provided');
    } else {
      improvements.push('Ensure all contact information is included and up-to-date');
    }

    if (certificationCount > 0) {
      strengths.push(`Professional development evident with ${certificationCount} certification(s)`);
    }

    recommendations.push('Quantify achievements with specific metrics and numbers');
    recommendations.push('Use strong action verbs to begin bullet points');
    recommendations.push('Tailor resume content for specific job applications');
    
    if (!analysis.personalInfo?.linkedin) {
      recommendations.push('Add LinkedIn profile to increase professional visibility');
    }
    
    if (technicalSkillCount < 7) {
      recommendations.push('Include more technical skills relevant to target positions');
    }

    if (experienceCount < 3) {
      recommendations.push('Add project experience or internships to strengthen background');
    }

    return {
      overallScore: finalScore,
      strengths,
      improvements,
      matchScore: Math.max(finalScore - 5, 0),
      recommendations
    };
  }
}

export const insightsGenerationService = new InsightsGenerationService();
