
import { chromeStorage } from '@/utils/chromeStorage';

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
}

class DocumentProcessingService {
  private async extractTextFromFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      if (file.type === 'application/pdf') {
        // For PDF files - in production, you'd use a library like pdf-parse
        reader.onload = () => {
          // Simulate PDF text extraction
          resolve(`Resume Content: ${file.name}
John Doe
Senior Software Engineer
Email: john.doe@email.com
Phone: (555) 123-4567
LinkedIn: linkedin.com/in/johndoe
GitHub: github.com/johndoe

EXPERIENCE
Senior Software Engineer | Tech Corp | 2020-Present
• Led development of React-based web applications
• Managed team of 5 developers
• Implemented CI/CD pipelines using Docker and AWS
• Reduced deployment time by 60%

Software Developer | StartupXYZ | 2018-2020
• Developed full-stack applications using Node.js and React
• Built RESTful APIs and microservices
• Collaborated with cross-functional teams

EDUCATION
Bachelor of Science in Computer Science
University of Technology | 2018
GPA: 3.8/4.0

SKILLS
Technical: JavaScript, TypeScript, React, Node.js, Python, AWS, Docker, Kubernetes, MongoDB, PostgreSQL, Git
Soft Skills: Leadership, Team Management, Problem Solving, Communication, Agile Development

CERTIFICATIONS
AWS Certified Solutions Architect
Certified Scrum Master`);
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      } else if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
      } else if (file.name.endsWith('.docx') || file.type.includes('wordprocessingml')) {
        // For DOCX files - in production, you'd use a library like mammoth.js
        reader.onload = () => {
          // Simulate DOCX text extraction
          resolve(`Resume Content from ${file.name}
Jane Smith
Product Manager
Email: jane.smith@email.com
Phone: (555) 987-6543
LinkedIn: linkedin.com/in/janesmith

EXPERIENCE
Senior Product Manager | Innovation Labs | 2021-Present
• Led product strategy for B2B SaaS platform
• Managed product roadmap and feature prioritization
• Coordinated with engineering, design, and marketing teams
• Increased user engagement by 40%

Product Manager | Digital Solutions | 2019-2021
• Defined product requirements and user stories
• Conducted market research and competitive analysis
• Worked closely with UX/UI designers

EDUCATION
MBA in Business Administration
Business School | 2019
Bachelor of Arts in Psychology
Liberal Arts College | 2017

SKILLS
Technical: Product Management, Data Analysis, SQL, Tableau, Jira, Figma
Soft Skills: Strategic Thinking, Leadership, Communication, Analytical Skills, Project Management`);
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      } else {
        reject(new Error('Unsupported file type'));
      }
    });
  }

  private parseResumeContent(text: string): Partial<DocumentAnalysis> {
    // Enhanced parsing logic with better pattern matching
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const phoneRegex = /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const linkedinRegex = /(?:linkedin\.com\/in\/|LinkedIn:\s*)[\w-]+/gi;
    const githubRegex = /(?:github\.com\/|GitHub:\s*)[\w-]+/gi;

    const emails = text.match(emailRegex) || [];
    const phones = text.match(phoneRegex) || [];
    const linkedinUrls = text.match(linkedinRegex) || [];
    const githubUrls = text.match(githubRegex) || [];

    // Extract name - look for common patterns
    const lines = text.split('\n').filter(line => line.trim());
    let name = 'Name not found';
    
    // Try to find name in first few lines
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i].trim();
      // Skip lines that look like headers, emails, phones
      if (line && !line.includes('@') && !line.match(/\d{3}/) && !line.includes('Resume') && line.length > 2) {
        name = line;
        break;
      }
    }

    // Enhanced skill extraction with more comprehensive lists
    const technicalSkillsDB = [
      'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue', 'Node.js', 'Python', 'Java', 'C#', 'C++',
      'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes',
      'Git', 'Jenkins', 'CI/CD', 'HTML', 'CSS', 'SASS', 'LESS', 'Bootstrap', 'Tailwind',
      'Express', 'Django', 'Flask', 'Spring', 'Laravel', 'Ruby', 'PHP', 'Go', 'Rust',
      'GraphQL', 'REST', 'API', 'Microservices', 'DevOps', 'Linux', 'Unix', 'Bash',
      'Terraform', 'Ansible', 'Jira', 'Confluence', 'Figma', 'Tableau', 'Power BI'
    ];

    const softSkillsDB = [
      'Leadership', 'Team Management', 'Communication', 'Problem Solving', 'Critical Thinking',
      'Project Management', 'Agile', 'Scrum', 'Strategic Planning', 'Analytical Skills',
      'Collaboration', 'Mentoring', 'Coaching', 'Public Speaking', 'Presentation Skills',
      'Time Management', 'Adaptability', 'Innovation', 'Creative Thinking', 'Negotiation',
      'Customer Service', 'Cross-functional', 'Stakeholder Management', 'Process Improvement'
    ];

    const technicalSkills = this.extractSkills(text, technicalSkillsDB);
    const softSkills = this.extractSkills(text, softSkillsDB);

    // Extract experience
    const experience = this.extractExperience(text);
    
    // Extract education
    const education = this.extractEducation(text);

    return {
      personalInfo: {
        name,
        email: emails[0] || '',
        phone: phones[0] || '',
        linkedin: linkedinUrls[0]?.replace(/LinkedIn:\s*/i, '') || '',
        github: githubUrls[0]?.replace(/GitHub:\s*/i, '') || ''
      },
      skills: {
        technical: technicalSkills,
        soft: softSkills
      },
      experience,
      education
    };
  }

  private extractSkills(text: string, skillList: string[]): string[] {
    const foundSkills: string[] = [];
    const lowerText = text.toLowerCase();
    
    skillList.forEach(skill => {
      // Use word boundaries for better matching
      const regex = new RegExp(`\\b${skill.toLowerCase()}\\b`, 'i');
      if (regex.test(lowerText)) {
        foundSkills.push(skill);
      }
    });
    
    return [...new Set(foundSkills)]; // Remove duplicates
  }

  private extractExperience(text: string): DocumentAnalysis['experience'] {
    const experience: DocumentAnalysis['experience'] = [];
    
    // Look for common experience patterns
    const experienceSection = text.match(/EXPERIENCE[\s\S]*?(?=EDUCATION|SKILLS|$)/i)?.[0] || '';
    
    if (experienceSection) {
      // Parse individual experience entries
      const entries = experienceSection.split(/\n(?=[A-Z])/);
      
      for (const entry of entries) {
        if (entry.trim() && !entry.match(/^EXPERIENCE$/i)) {
          const lines = entry.split('\n').filter(line => line.trim());
          if (lines.length >= 2) {
            const titleCompany = lines[0].trim();
            const highlights = lines.slice(1).filter(line => line.startsWith('•') || line.startsWith('-')).map(line => line.replace(/^[•-]\s*/, ''));
            
            experience.push({
              title: titleCompany.split('|')[0]?.trim() || 'Position',
              company: titleCompany.split('|')[1]?.trim() || 'Company',
              duration: titleCompany.split('|')[2]?.trim() || 'Duration not specified',
              highlights
            });
          }
        }
      }
    }

    return experience;
  }

  private extractEducation(text: string): DocumentAnalysis['education'] {
    const education: DocumentAnalysis['education'] = [];
    
    // Look for education section
    const educationSection = text.match(/EDUCATION[\s\S]*?(?=SKILLS|EXPERIENCE|CERTIFICATIONS|$)/i)?.[0] || '';
    
    if (educationSection) {
      const lines = educationSection.split('\n').filter(line => line.trim() && !line.match(/^EDUCATION$/i));
      
      for (let i = 0; i < lines.length; i += 2) {
        if (lines[i]) {
          const degree = lines[i].trim();
          const institutionYear = lines[i + 1]?.trim() || '';
          const parts = institutionYear.split('|');
          
          education.push({
            degree,
            institution: parts[0]?.trim() || 'Institution not specified',
            year: parts[1]?.trim() || 'Year not specified',
            gpa: text.match(/GPA:\s*([\d.]+)/i)?.[1]
          });
        }
      }
    }

    return education;
  }

  private generateInsights(analysis: Partial<DocumentAnalysis>): DocumentAnalysis['insights'] {
    const technicalSkillCount = analysis.skills?.technical?.length || 0;
    const softSkillCount = analysis.skills?.soft?.length || 0;
    const experienceCount = analysis.experience?.length || 0;
    const educationCount = analysis.education?.length || 0;
    const hasContact = !!(analysis.personalInfo?.email && analysis.personalInfo?.phone);
    
    // More sophisticated scoring algorithm
    let score = 40; // Base score
    
    // Skills scoring
    if (technicalSkillCount >= 8) score += 20;
    else if (technicalSkillCount >= 5) score += 15;
    else if (technicalSkillCount >= 3) score += 10;
    
    if (softSkillCount >= 5) score += 15;
    else if (softSkillCount >= 3) score += 10;
    
    // Experience scoring
    if (experienceCount >= 3) score += 15;
    else if (experienceCount >= 2) score += 10;
    else if (experienceCount >= 1) score += 5;
    
    // Contact info scoring
    if (hasContact) score += 10;
    if (analysis.personalInfo?.linkedin) score += 5;
    if (analysis.personalInfo?.github) score += 5;
    
    // Education scoring
    if (educationCount >= 1) score += 5;

    const finalScore = Math.min(score, 95); // Cap at 95

    const strengths: string[] = [];
    const improvements: string[] = [];
    const recommendations: string[] = [];

    // Generate dynamic insights based on actual content
    if (technicalSkillCount >= 5) {
      strengths.push(`Strong technical skill set with ${technicalSkillCount} relevant technologies`);
    } else {
      improvements.push('Consider adding more technical skills relevant to your target role');
    }

    if (softSkillCount >= 3) {
      strengths.push(`Well-rounded professional with ${softSkillCount} key soft skills`);
    } else {
      improvements.push('Highlight more soft skills and leadership qualities');
    }

    if (hasContact) {
      strengths.push('Complete contact information provided');
    } else {
      improvements.push('Ensure all contact information is included');
    }

    if (experienceCount >= 2) {
      strengths.push(`Solid work experience with ${experienceCount} positions listed`);
    } else {
      improvements.push('Consider adding more detailed work experience');
    }

    // Generate recommendations
    recommendations.push('Use action verbs to start bullet points (e.g., "Led", "Developed", "Implemented")');
    recommendations.push('Quantify achievements with specific metrics and numbers');
    recommendations.push('Tailor your resume for each specific job application');
    
    if (!analysis.personalInfo?.linkedin) {
      recommendations.push('Add your LinkedIn profile URL');
    }
    
    if (technicalSkillCount < 5) {
      recommendations.push('Include more relevant technical skills for your industry');
    }

    return {
      overallScore: finalScore,
      strengths,
      improvements,
      matchScore: Math.max(finalScore - 5, 0),
      recommendations
    };
  }

  async processDocument(file: File): Promise<ProcessedDocument> {
    const document: ProcessedDocument = {
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.type,
      size: file.size,
      status: 'processing',
      uploadedAt: Date.now()
    };

    try {
      console.log('Starting document processing for:', file.name);
      
      // Extract text from file
      const rawText = await this.extractTextFromFile(file);
      document.rawText = rawText;
      
      console.log('Text extracted, length:', rawText.length);

      // Parse content
      const parsedContent = this.parseResumeContent(rawText);
      
      console.log('Content parsed:', parsedContent);

      // Generate full analysis
      const analysis: DocumentAnalysis = {
        personalInfo: parsedContent.personalInfo || {
          name: 'Not found',
          email: '',
          phone: ''
        },
        skills: parsedContent.skills || { technical: [], soft: [] },
        experience: parsedContent.experience || [],
        education: parsedContent.education || [],
        certifications: [], // Will be enhanced in future updates
        insights: this.generateInsights(parsedContent)
      };

      document.analysis = analysis;
      document.status = 'completed';

      console.log('Document processed successfully:', document);

      // Save to storage
      await this.saveDocument(document);

      return document;
    } catch (error) {
      console.error('Document processing failed:', error);
      document.status = 'error';
      await this.saveDocument(document); // Save error state too
      return document;
    }
  }

  async saveDocument(document: ProcessedDocument): Promise<void> {
    try {
      const documents = await this.getDocuments();
      const existingIndex = documents.findIndex(doc => doc.id === document.id);
      
      if (existingIndex >= 0) {
        documents[existingIndex] = document;
      } else {
        documents.push(document);
      }
      
      await chromeStorage.setItem('processedDocuments', documents);
      console.log('Document saved to storage');
    } catch (error) {
      console.error('Failed to save document:', error);
      throw error;
    }
  }

  async getDocuments(): Promise<ProcessedDocument[]> {
    try {
      const documents = await chromeStorage.getItem('processedDocuments') || [];
      console.log('Retrieved documents from storage:', documents.length);
      return documents;
    } catch (error) {
      console.error('Failed to get documents:', error);
      return [];
    }
  }

  async deleteDocument(id: string): Promise<void> {
    try {
      const documents = await this.getDocuments();
      const filtered = documents.filter(doc => doc.id !== id);
      await chromeStorage.setItem('processedDocuments', filtered);
      console.log('Document deleted:', id);
    } catch (error) {
      console.error('Failed to delete document:', error);
      throw error;
    }
  }
}

export const documentProcessingService = new DocumentProcessingService();
