
import { DocumentAnalysis } from '@/types/documentTypes';

export class ContentParsingService {
  parseResumeContent(text: string): Partial<DocumentAnalysis> {
    console.log('Parsing resume content, text length:', text.length);
    console.log('Text preview:', text.substring(0, 500));
    
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const phoneRegex = /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const linkedinRegex = /(?:linkedin\.com\/in\/|LinkedIn:\s*)[\w-]+/gi;
    const githubRegex = /(?:github\.com\/|GitHub:\s*)[\w-]+/gi;

    const emails = text.match(emailRegex) || [];
    const phones = text.match(phoneRegex) || [];
    const linkedinUrls = text.match(linkedinRegex) || [];
    const githubUrls = text.match(githubRegex) || [];

    const lines = text.split('\n').filter(line => line.trim());
    let name = 'Name not found';
    
    for (let i = 0; i < Math.min(3, lines.length); i++) {
      const line = lines[i].trim();
      if (line && 
          !line.includes('@') && 
          !line.match(/\d{3}/) && 
          !line.toLowerCase().includes('resume') &&
          !line.toLowerCase().includes('cv') &&
          line.length > 2 && 
          line.length < 50 &&
          !/^\d/.test(line)) {
        name = line;
        break;
      }
    }

    const technicalSkills = this.extractTechnicalSkills(text);
    const softSkills = this.extractSoftSkills(text);
    const experience = this.extractExperience(text);
    const education = this.extractEducation(text);
    const certifications = this.extractCertifications(text);

    console.log('Parsed data:', { 
      name, 
      email: emails[0], 
      technicalSkills: technicalSkills.length, 
      softSkills: softSkills.length,
      experience: experience.length,
      education: education.length
    });

    return {
      personalInfo: {
        name,
        email: emails[0] || '',
        phone: phones[0] || '',
        linkedin: linkedinUrls[0]?.replace(/LinkedIn:\s*/i, '') || '',
        github: githubUrls[0]?.replace(/GitHub:\s*/i, '') || '',
        location: this.extractLocation(text)
      },
      skills: {
        technical: technicalSkills,
        soft: softSkills
      },
      experience,
      education,
      certifications
    };
  }

  private extractLocation(text: string): string {
    const locationPatterns = [
      /Location:\s*([^\n]+)/i,
      /Address:\s*([^\n]+)/i,
      /Based in:\s*([^\n]+)/i,
      /([\w\s]+,\s*[\w\s]+,?\s*[\w\s]*)/g
    ];

    for (const pattern of locationPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return '';
  }

  private extractTechnicalSkills(text: string): string[] {
    const technicalSkillsDB = [
      'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue', 'Node.js', 'Python', 'Java', 'C#', 'C++', 'Go', 'Rust',
      'HTML', 'CSS', 'SASS', 'LESS', 'Bootstrap', 'Tailwind', 'Material-UI', 'Ant Design',
      'Express', 'Django', 'Flask', 'Spring', 'Laravel', 'Ruby on Rails', 'ASP.NET',
      'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch', 'DynamoDB',
      'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'GitLab CI', 'GitHub Actions',
      'Git', 'SVN', 'Mercurial', 'Webpack', 'Vite', 'Parcel', 'Rollup',
      'GraphQL', 'REST', 'SOAP', 'gRPC', 'Microservices', 'Serverless',
      'Linux', 'Unix', 'Windows', 'macOS', 'Bash', 'PowerShell',
      'Terraform', 'Ansible', 'Chef', 'Puppet', 'Vagrant',
      'Jira', 'Confluence', 'Figma', 'Sketch', 'Adobe XD',
      'Tableau', 'Power BI', 'Google Analytics', 'Mixpanel',
      'TensorFlow', 'PyTorch', 'scikit-learn', 'Pandas', 'NumPy'
    ];

    return this.extractSkills(text, technicalSkillsDB);
  }

  private extractSoftSkills(text: string): string[] {
    const softSkillsDB = [
      'Leadership', 'Team Management', 'Project Management', 'Communication', 'Problem Solving',
      'Critical Thinking', 'Strategic Planning', 'Analytical Skills', 'Decision Making',
      'Collaboration', 'Teamwork', 'Mentoring', 'Coaching', 'Training',
      'Public Speaking', 'Presentation', 'Negotiation', 'Customer Service',
      'Time Management', 'Organization', 'Adaptability', 'Flexibility',
      'Innovation', 'Creativity', 'Attention to Detail', 'Quality Assurance',
      'Agile', 'Scrum', 'Kanban', 'Lean', 'Six Sigma',
      'Cross-functional', 'Stakeholder Management', 'Process Improvement',
      'Conflict Resolution', 'Emotional Intelligence', 'Cultural Awareness'
    ];

    return this.extractSkills(text, softSkillsDB);
  }

  private extractSkills(text: string, skillList: string[]): string[] {
    const foundSkills: string[] = [];
    const lowerText = text.toLowerCase();
    
    skillList.forEach(skill => {
      const lowerSkill = skill.toLowerCase();
      if (lowerText.includes(lowerSkill)) {
        foundSkills.push(skill);
      }
    });
    
    return [...new Set(foundSkills)];
  }

  private extractExperience(text: string): DocumentAnalysis['experience'] {
    const experience: DocumentAnalysis['experience'] = [];
    
    const sections = text.split(/(?=EXPERIENCE|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE)/i);
    const experienceSection = sections.find(section => 
      /^(EXPERIENCE|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE)/i.test(section)
    );
    
    if (experienceSection) {
      const lines = experienceSection.split('\n').filter(line => line.trim());
      let currentJob: any = null;
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        if (/^(EXPERIENCE|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE)$/i.test(trimmedLine)) {
          continue;
        }
        
        if (trimmedLine.includes('|') && !trimmedLine.startsWith('•') && !trimmedLine.startsWith('-')) {
          if (currentJob) {
            experience.push(currentJob);
          }
          
          const parts = trimmedLine.split('|').map(p => p.trim());
          currentJob = {
            title: parts[0] || 'Position',
            company: parts[1] || 'Company',
            duration: parts[2] || 'Duration not specified',
            highlights: []
          };
        }
        else if ((trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) && currentJob) {
          currentJob.highlights.push(trimmedLine.replace(/^[•-]\s*/, ''));
        }
      }
      
      if (currentJob) {
        experience.push(currentJob);
      }
    }

    return experience;
  }

  private extractEducation(text: string): DocumentAnalysis['education'] {
    const education: DocumentAnalysis['education'] = [];
    
    const sections = text.split(/(?=EDUCATION|ACADEMIC BACKGROUND)/i);
    const educationSection = sections.find(section => 
      /^(EDUCATION|ACADEMIC BACKGROUND)/i.test(section)
    );
    
    if (educationSection) {
      const lines = educationSection.split('\n').filter(line => 
        line.trim() && !/^(EDUCATION|ACADEMIC BACKGROUND)$/i.test(line.trim())
      );
      
      for (let i = 0; i < lines.length; i += 2) {
        const degreeLine = lines[i]?.trim();
        const institutionLine = lines[i + 1]?.trim();
        
        if (degreeLine) {
          const parts = institutionLine?.split('|') || [];
          education.push({
            degree: degreeLine,
            institution: parts[0]?.trim() || 'Institution not specified',
            year: parts[1]?.trim() || 'Year not specified',
            gpa: this.extractGPA(educationSection)
          });
        }
      }
    }

    return education;
  }

  private extractGPA(text: string): string | undefined {
    const gpaMatch = text.match(/(?:GPA|CGPA):\s*([\d.]+)/i);
    return gpaMatch ? gpaMatch[1] : undefined;
  }

  private extractCertifications(text: string): string[] {
    const certifications: string[] = [];
    
    const sections = text.split(/(?=CERTIFICATIONS|CERTIFICATES)/i);
    const certSection = sections.find(section => 
      /^(CERTIFICATIONS|CERTIFICATES)/i.test(section)
    );
    
    if (certSection) {
      const lines = certSection.split('\n').filter(line => 
        line.trim() && !/^(CERTIFICATIONS|CERTIFICATES)$/i.test(line.trim())
      );
      
      lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('•') && !trimmed.startsWith('-')) {
          certifications.push(trimmed);
        }
      });
    }

    return certifications;
  }
}

export const contentParsingService = new ContentParsingService();
