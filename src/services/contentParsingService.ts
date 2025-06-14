import { DocumentAnalysis } from '@/types/documentTypes';

export class ContentParsingService {
  parseResumeContent(text: string): Partial<DocumentAnalysis> {
    console.log('=== CONTENT PARSING START ===');
    console.log('Text length:', text.length);
    console.log('Text preview:', text.substring(0, 300));
    
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
    
    // Find name in first few lines
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i].trim();
      if (line && 
          !line.includes('@') && 
          !line.match(/\+?\d{3}/) && 
          !line.toLowerCase().includes('resume') &&
          !line.toLowerCase().includes('cv') &&
          !line.toLowerCase().includes('software') &&
          !line.toLowerCase().includes('engineer') &&
          !line.toLowerCase().includes('developer') &&
          line.length > 2 && 
          line.length < 50 &&
          !/^\d/.test(line) &&
          !/^(phone|email|location)/i.test(line)) {
        name = line;
        console.log('Found name:', name);
        break;
      }
    }

    const technicalSkills = this.extractTechnicalSkills(text);
    const softSkills = this.extractSoftSkills(text);
    const experience = this.extractExperience(text);
    const education = this.extractEducation(text);
    const certifications = this.extractCertifications(text);

    console.log('=== PARSING RESULTS ===');
    console.log('Name:', name);
    console.log('Email:', emails[0] || 'Not found');
    console.log('Technical skills:', technicalSkills.length, technicalSkills);
    console.log('Soft skills:', softSkills.length, softSkills);
    console.log('Experience entries:', experience.length, experience);
    console.log('Education entries:', education.length, education);
    console.log('Certifications:', certifications.length, certifications);

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
      /([\w\s]+,\s*[\w\s]+(?:,\s*[\w\s]*)?)/g
    ];

    for (const pattern of locationPatterns) {
      const match = text.match(pattern);
      if (match && match[1] && match[1].length < 100) {
        return match[1].trim();
      }
    }
    return '';
  }

  private extractExperience(text: string): DocumentAnalysis['experience'] {
    console.log('=== EXTRACTING EXPERIENCE ===');
    const experience: DocumentAnalysis['experience'] = [];
    
    // Look for experience section
    const experiencePatterns = [
      /EXPERIENCE\n([\s\S]*?)(?=\n(?:EDUCATION|SKILLS|PROJECTS|CERTIFICATIONS|$))/i,
      /WORK EXPERIENCE\n([\s\S]*?)(?=\n(?:EDUCATION|SKILLS|PROJECTS|CERTIFICATIONS|$))/i,
      /PROFESSIONAL EXPERIENCE\n([\s\S]*?)(?=\n(?:EDUCATION|SKILLS|PROJECTS|CERTIFICATIONS|$))/i
    ];

    let experienceSection = '';
    for (const pattern of experiencePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        experienceSection = match[1];
        console.log('Found experience section:', experienceSection.substring(0, 200));
        break;
      }
    }

    if (experienceSection) {
      const lines = experienceSection.split('\n').filter(line => line.trim());
      let currentJob: any = null;
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        console.log('Processing line:', trimmedLine);
        
        // Check if this is a job title/company line (contains |)
        if (trimmedLine.includes('|') && !trimmedLine.startsWith('•') && !trimmedLine.startsWith('-')) {
          // Save previous job if exists
          if (currentJob) {
            experience.push(currentJob);
            console.log('Added job:', currentJob.title, 'at', currentJob.company);
          }
          
          const parts = trimmedLine.split('|').map(p => p.trim());
          currentJob = {
            title: parts[0] || 'Position',
            company: parts[1] || 'Company',
            duration: parts[2] || 'Duration not specified',
            highlights: []
          };
          console.log('Started new job:', currentJob);
        }
        // Check if this is a highlight/bullet point
        else if ((trimmedLine.startsWith('•') || trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) && currentJob) {
          const highlight = trimmedLine.replace(/^[•\-*]\s*/, '');
          currentJob.highlights.push(highlight);
          console.log('Added highlight:', highlight);
        }
      }
      
      // Add the last job
      if (currentJob) {
        experience.push(currentJob);
        console.log('Added final job:', currentJob.title, 'at', currentJob.company);
      }
    }

    console.log('Final experience array:', experience.length, 'entries');
    return experience;
  }

  private extractEducation(text: string): DocumentAnalysis['education'] {
    console.log('=== EXTRACTING EDUCATION ===');
    const education: DocumentAnalysis['education'] = [];
    
    // Look for education section
    const educationPatterns = [
      /EDUCATION\n([\s\S]*?)(?=\n(?:EXPERIENCE|SKILLS|PROJECTS|CERTIFICATIONS|$))/i,
      /ACADEMIC BACKGROUND\n([\s\S]*?)(?=\n(?:EXPERIENCE|SKILLS|PROJECTS|CERTIFICATIONS|$))/i
    ];

    let educationSection = '';
    for (const pattern of educationPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        educationSection = match[1];
        console.log('Found education section:', educationSection);
        break;
      }
    }
    
    if (educationSection) {
      const lines = educationSection.split('\n').filter(line => 
        line.trim() && 
        !/^(EDUCATION|ACADEMIC BACKGROUND)$/i.test(line.trim()) &&
        !line.trim().startsWith('SKILLS') &&
        !line.trim().startsWith('PROJECTS')
      );
      
      console.log('Education lines:', lines);
      
      // Look for degree and institution patterns
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Skip empty lines
        if (!line) continue;
        
        // Check if this looks like a degree line
        if (line.includes('|')) {
          const parts = line.split('|').map(p => p.trim());
          if (parts.length >= 2) {
            education.push({
              degree: parts[0],
              institution: parts[1],
              year: parts[2] || 'Year not specified',
              gpa: this.extractGPA(line)
            });
          }
        } else if (line.toLowerCase().includes('bachelor') || 
                   line.toLowerCase().includes('master') || 
                   line.toLowerCase().includes('degree') ||
                   line.toLowerCase().includes('university') ||
                   line.toLowerCase().includes('college')) {
          // This might be a degree line, check next line for institution
          const nextLine = lines[i + 1]?.trim();
          education.push({
            degree: line,
            institution: nextLine || 'Institution not specified',
            year: this.extractYear(line + ' ' + (nextLine || '')),
            gpa: this.extractGPA(line + ' ' + (nextLine || ''))
          });
          if (nextLine) i++; // Skip next line since we used it
        }
      }
    }

    console.log('Final education array:', education.length, 'entries', education);
    return education;
  }

  private extractYear(text: string): string {
    const yearMatch = text.match(/\b(19|20)\d{2}\b/);
    return yearMatch ? yearMatch[0] : 'Year not specified';
  }

  private extractGPA(text: string): string | undefined {
    const gpaMatch = text.match(/(?:GPA|CGPA):\s*([\d.]+)/i);
    return gpaMatch ? gpaMatch[1] : undefined;
  }

  private extractCertifications(text: string): string[] {
    console.log('=== EXTRACTING CERTIFICATIONS ===');
    const certifications: string[] = [];
    
    const certPatterns = [
      /CERTIFICATIONS\n([\s\S]*?)(?=\n(?:EXPERIENCE|EDUCATION|SKILLS|PROJECTS|$))/i,
      /CERTIFICATES\n([\s\S]*?)(?=\n(?:EXPERIENCE|EDUCATION|SKILLS|PROJECTS|$))/i
    ];
    
    let certSection = '';
    for (const pattern of certPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        certSection = match[1];
        break;
      }
    }
    
    if (certSection) {
      const lines = certSection.split('\n').filter(line => 
        line.trim() && 
        !/^(CERTIFICATIONS|CERTIFICATES)$/i.test(line.trim())
      );
      
      lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('•') && !trimmed.startsWith('-')) {
          certifications.push(trimmed);
        }
      });
    }

    console.log('Found certifications:', certifications);
    return certifications;
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
}

export const contentParsingService = new ContentParsingService();
