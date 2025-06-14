
export class TextExtractionService {
  async extractTextFromFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        reader.onload = async () => {
          try {
            const text = await this.simulatePDFExtraction(file.name);
            resolve(text);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      } else if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
      } else if (file.name.toLowerCase().endsWith('.docx') || file.type.includes('wordprocessingml')) {
        reader.onload = async () => {
          try {
            const text = await this.simulateDOCXExtraction(file.name);
            resolve(text);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      } else {
        reject(new Error('Unsupported file type'));
      }
    });
  }

  private async simulatePDFExtraction(fileName: string): Promise<string> {
    const name = fileName.toLowerCase();
    
    if (name.includes('veerababu') || name.includes('manyam')) {
      return `VeeraBabu Manyam
Software Engineer
Email: veerababu.manyam@email.com
Phone: +91-9876543210
LinkedIn: linkedin.com/in/veerababu-manyam
Location: Hyderabad, India

PROFESSIONAL SUMMARY
Experienced Software Engineer with 7+ years in full-stack development, specializing in React, Node.js, and cloud technologies.

EXPERIENCE

Senior Software Engineer | TechCorp Solutions | 2021-Present
• Developed scalable React applications serving 500K+ users
• Led team of 6 developers using Agile methodologies
• Implemented microservices architecture reducing system latency by 40%
• Built CI/CD pipelines with Docker and Kubernetes

Software Developer | InnovateIT | 2019-2021
• Created full-stack web applications using MEAN stack
• Designed RESTful APIs and optimized database queries
• Collaborated with cross-functional teams of 12+ members
• Reduced application load time by 35% through performance optimization

Junior Developer | StartupHub | 2017-2019
• Developed responsive web interfaces using React and Angular
• Implemented unit and integration tests achieving 90% code coverage
• Participated in code reviews and mentored 2 junior developers

EDUCATION
Bachelor of Technology in Computer Science
JNTUH University | 2017
CGPA: 8.5/10

SKILLS
Technical: JavaScript, TypeScript, React, Angular, Node.js, Python, Java, AWS, Docker, Kubernetes, MongoDB, PostgreSQL, Git, Jenkins
Soft: Leadership, Problem Solving, Team Collaboration, Agile Development, Mentoring

PROJECTS
E-Commerce Platform | 2023
• Built scalable e-commerce platform using React and Node.js
• Integrated payment gateways and inventory management
• Achieved 99.9% uptime with load balancing

CERTIFICATIONS
AWS Certified Solutions Architect
Certified Kubernetes Administrator`;
    }
    
    return `${fileName.replace(/\.[^/.]+$/, "").replace(/_/g, ' ')}
Software Professional
Email: professional@email.com
Phone: (555) 123-4567

PROFESSIONAL SUMMARY
Experienced professional with expertise in software development and technology solutions.

EXPERIENCE
Software Engineer | Tech Company | 2020-Present
• Developed web applications and software solutions
• Collaborated with development teams
• Implemented best practices and coding standards

SKILLS
Technical: JavaScript, React, Node.js, Python, SQL
Soft: Communication, Problem Solving, Team Work

EDUCATION
Bachelor's Degree in Computer Science
University | 2019`;
  }

  private async simulateDOCXExtraction(fileName: string): Promise<string> {
    return this.simulatePDFExtraction(fileName);
  }
}

export const textExtractionService = new TextExtractionService();
