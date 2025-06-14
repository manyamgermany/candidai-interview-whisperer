
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
      if (file.type === 'application/pdf') {
        // For PDF files, we'll use a simple text extraction
        const reader = new FileReader();
        reader.onload = () => {
          // In a real implementation, you'd use a PDF parsing library
          // For now, we'll simulate extraction
          resolve(`Extracted text from ${file.name} - This would contain the actual resume content in production.`);
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      } else if (file.type.includes('text') || file.name.endsWith('.txt')) {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
      } else {
        reject(new Error('Unsupported file type'));
      }
    });
  }

  private parseResumeContent(text: string): Partial<DocumentAnalysis> {
    // Basic parsing logic - in production, this would use NLP/AI
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const phoneRegex = /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const linkedinRegex = /linkedin\.com\/in\/[\w-]+/gi;
    const githubRegex = /github\.com\/[\w-]+/gi;

    const emails = text.match(emailRegex) || [];
    const phones = text.match(phoneRegex) || [];
    const linkedinUrls = text.match(linkedinRegex) || [];
    const githubUrls = text.match(githubRegex) || [];

    // Extract name (assume it's one of the first lines)
    const lines = text.split('\n').filter(line => line.trim());
    const name = lines[0]?.trim() || 'Name not found';

    // Basic skill extraction
    const technicalSkills = this.extractSkills(text, [
      'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'SQL',
      'AWS', 'Docker', 'Kubernetes', 'Git', 'MongoDB', 'PostgreSQL'
    ]);

    const softSkills = this.extractSkills(text, [
      'Leadership', 'Communication', 'Problem Solving', 'Team Management',
      'Project Management', 'Agile', 'Scrum'
    ]);

    return {
      personalInfo: {
        name,
        email: emails[0] || '',
        phone: phones[0] || '',
        linkedin: linkedinUrls[0] || '',
        github: githubUrls[0] || ''
      },
      skills: {
        technical: technicalSkills,
        soft: softSkills
      }
    };
  }

  private extractSkills(text: string, skillList: string[]): string[] {
    const foundSkills: string[] = [];
    const lowerText = text.toLowerCase();
    
    skillList.forEach(skill => {
      if (lowerText.includes(skill.toLowerCase())) {
        foundSkills.push(skill);
      }
    });
    
    return foundSkills;
  }

  private generateInsights(analysis: Partial<DocumentAnalysis>): DocumentAnalysis['insights'] {
    const technicalSkillCount = analysis.skills?.technical?.length || 0;
    const softSkillCount = analysis.skills?.soft?.length || 0;
    const hasContact = !!(analysis.personalInfo?.email && analysis.personalInfo?.phone);
    
    let score = 60; // Base score
    if (technicalSkillCount > 5) score += 15;
    if (softSkillCount > 3) score += 10;
    if (hasContact) score += 10;
    if (analysis.personalInfo?.linkedin) score += 5;

    return {
      overallScore: Math.min(score, 100),
      strengths: [
        technicalSkillCount > 5 ? 'Strong technical skill set' : 'Good technical foundation',
        hasContact ? 'Complete contact information' : 'Basic contact details provided',
        'Professional presentation'
      ],
      improvements: [
        technicalSkillCount < 5 ? 'Add more technical skills' : 'Consider emerging technologies',
        !analysis.personalInfo?.linkedin ? 'Add LinkedIn profile' : 'Update social profiles',
        'Include quantifiable achievements'
      ],
      matchScore: Math.min(score - 5, 95),
      recommendations: [
        'Highlight specific project achievements',
        'Use action verbs in experience descriptions',
        'Tailor content for target role'
      ]
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
      // Extract text from file
      const rawText = await this.extractTextFromFile(file);
      document.rawText = rawText;

      // Parse content
      const parsedContent = this.parseResumeContent(rawText);
      
      // Generate full analysis
      const analysis: DocumentAnalysis = {
        personalInfo: parsedContent.personalInfo || {
          name: 'Not found',
          email: '',
          phone: ''
        },
        skills: parsedContent.skills || { technical: [], soft: [] },
        experience: [
          {
            title: 'Experience parsing in development',
            company: 'Various Companies',
            duration: 'Extracted from resume',
            highlights: ['Experience details would be parsed from resume content']
          }
        ],
        education: [
          {
            degree: 'Education parsing in development',
            institution: 'Extracted from resume',
            year: 'TBD'
          }
        ],
        certifications: ['Certification parsing in development'],
        insights: this.generateInsights(parsedContent)
      };

      document.analysis = analysis;
      document.status = 'completed';

      // Save to storage
      await this.saveDocument(document);

      return document;
    } catch (error) {
      console.error('Document processing failed:', error);
      document.status = 'error';
      return document;
    }
  }

  async saveDocument(document: ProcessedDocument): Promise<void> {
    try {
      const documents = await this.getDocuments();
      documents.push(document);
      await chromeStorage.setItem('processedDocuments', documents);
    } catch (error) {
      console.error('Failed to save document:', error);
    }
  }

  async getDocuments(): Promise<ProcessedDocument[]> {
    try {
      return await chromeStorage.getItem('processedDocuments') || [];
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
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  }
}

export const documentProcessingService = new DocumentProcessingService();
