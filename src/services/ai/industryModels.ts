
import { IndustryType, InterviewType } from '@/types/interviewTypes';

export interface IndustryPromptTemplate {
  industry: IndustryType;
  systemPrompt: string;
  keyFocusAreas: string[];
  commonQuestions: string[];
  frameworks: string[];
  terminology: string[];
}

export class IndustrySpecificModels {
  private static industryTemplates: Record<IndustryType, IndustryPromptTemplate> = {
    technology: {
      industry: 'technology',
      systemPrompt: 'You are an expert tech interview coach with deep knowledge of software development, system design, and technical leadership. Focus on technical competency, problem-solving approach, and scalability thinking.',
      keyFocusAreas: ['Technical Skills', 'System Design', 'Problem Solving', 'Code Quality', 'Scalability', 'Team Collaboration'],
      commonQuestions: ['System design', 'Coding challenges', 'Technical trade-offs', 'Architecture decisions'],
      frameworks: ['STAR', 'CAR', 'Problem-Solution-Impact'],
      terminology: ['API', 'Microservices', 'Cloud', 'DevOps', 'Agile', 'CI/CD', 'Scalability', 'Performance']
    },
    finance: {
      industry: 'finance',
      systemPrompt: 'You are an expert finance interview coach with deep knowledge of financial analysis, risk management, and regulatory compliance. Focus on analytical thinking, attention to detail, and risk assessment.',
      keyFocusAreas: ['Financial Analysis', 'Risk Management', 'Regulatory Knowledge', 'Market Understanding', 'Client Relations', 'Compliance'],
      commonQuestions: ['Market analysis', 'Risk assessment', 'Portfolio management', 'Regulatory compliance'],
      frameworks: ['STAR', 'Situation-Analysis-Recommendation', 'Risk-Return-Mitigation'],
      terminology: ['ROI', 'Risk Assessment', 'Compliance', 'Portfolio', 'Derivatives', 'Volatility', 'Due Diligence']
    },
    consulting: {
      industry: 'consulting',
      systemPrompt: 'You are an expert management consulting interview coach with deep knowledge of case interviews, business strategy, and client management. Focus on structured thinking, business acumen, and communication.',
      keyFocusAreas: ['Structured Thinking', 'Business Strategy', 'Client Management', 'Problem Solving', 'Communication', 'Leadership'],
      commonQuestions: ['Case studies', 'Business strategy', 'Client situations', 'Market analysis'],
      frameworks: ['Issue Tree', 'Hypothesis-driven', 'MECE', 'STAR', 'Situation-Complication-Resolution'],
      terminology: ['ROI', 'Market Share', 'Value Proposition', 'Stakeholders', 'KPIs', 'Strategic Planning']
    },
    healthcare: {
      industry: 'healthcare',
      systemPrompt: 'You are an expert healthcare interview coach with knowledge of patient care, medical regulations, and healthcare operations. Focus on patient safety, compliance, and empathetic communication.',
      keyFocusAreas: ['Patient Care', 'Regulatory Compliance', 'Safety Protocols', 'Team Collaboration', 'Continuous Learning'],
      commonQuestions: ['Patient scenarios', 'Compliance situations', 'Team coordination', 'Emergency responses'],
      frameworks: ['STAR', 'SBAR', 'Patient-Problem-Solution-Outcome'],
      terminology: ['Patient Safety', 'HIPAA', 'Clinical Protocols', 'Quality Assurance', 'Care Coordination']
    },
    marketing: {
      industry: 'marketing',
      systemPrompt: 'You are an expert marketing interview coach with knowledge of digital marketing, brand strategy, and customer acquisition. Focus on creativity, data-driven decisions, and customer understanding.',
      keyFocusAreas: ['Brand Strategy', 'Digital Marketing', 'Customer Insights', 'Campaign Performance', 'Creative Problem Solving'],
      commonQuestions: ['Campaign strategies', 'Brand challenges', 'Customer acquisition', 'Performance metrics'],
      frameworks: ['STAR', 'Challenge-Strategy-Execution-Results', 'Customer-Problem-Solution-Impact'],
      terminology: ['ROI', 'Conversion Rate', 'Brand Equity', 'Customer Journey', 'Attribution', 'A/B Testing']
    },
    sales: {
      industry: 'sales',
      systemPrompt: 'You are an expert sales interview coach with knowledge of sales processes, customer relationships, and revenue generation. Focus on relationship building, negotiation, and results achievement.',
      keyFocusAreas: ['Relationship Building', 'Sales Process', 'Negotiation', 'Customer Needs', 'Revenue Generation'],
      commonQuestions: ['Sales scenarios', 'Customer objections', 'Deal negotiations', 'Relationship management'],
      frameworks: ['STAR', 'Challenge-Approach-Result', 'Customer-Need-Solution-Outcome'],
      terminology: ['Pipeline', 'Conversion Rate', 'Customer Acquisition Cost', 'Lifetime Value', 'Closing Rate']
    },
    operations: {
      industry: 'operations',
      systemPrompt: 'You are an expert operations interview coach with knowledge of process optimization, supply chain, and efficiency improvement. Focus on analytical thinking, process improvement, and cost optimization.',
      keyFocusAreas: ['Process Optimization', 'Supply Chain', 'Cost Reduction', 'Quality Management', 'Team Leadership'],
      commonQuestions: ['Process improvements', 'Efficiency challenges', 'Quality issues', 'Cost optimization'],
      frameworks: ['STAR', 'Problem-Analysis-Solution-Result', 'Current State-Future State-Implementation'],
      terminology: ['KPIs', 'Process Improvement', 'Supply Chain', 'Cost Optimization', 'Quality Metrics']
    },
    product: {
      industry: 'product',
      systemPrompt: 'You are an expert product management interview coach with knowledge of product strategy, user experience, and market analysis. Focus on customer-centricity, data-driven decisions, and strategic thinking.',
      keyFocusAreas: ['Product Strategy', 'User Experience', 'Market Analysis', 'Data-Driven Decisions', 'Stakeholder Management'],
      commonQuestions: ['Product decisions', 'User research', 'Feature prioritization', 'Market positioning'],
      frameworks: ['STAR', 'User-Problem-Solution-Impact', 'Hypothesis-Test-Learn-Iterate'],
      terminology: ['Product-Market Fit', 'User Journey', 'A/B Testing', 'Feature Prioritization', 'Metrics', 'Roadmap']
    },
    design: {
      industry: 'design',
      systemPrompt: 'You are an expert design interview coach with knowledge of user-centered design, design thinking, and creative problem solving. Focus on design process, user empathy, and visual communication.',
      keyFocusAreas: ['Design Process', 'User Research', 'Visual Communication', 'Problem Solving', 'Collaboration'],
      commonQuestions: ['Design challenges', 'User research', 'Design decisions', 'Creative process'],
      frameworks: ['STAR', 'Empathize-Define-Ideate-Prototype-Test', 'Problem-Research-Design-Validate'],
      terminology: ['User Experience', 'User Interface', 'Design System', 'Usability', 'Accessibility', 'Design Thinking']
    },
    general: {
      industry: 'general',
      systemPrompt: 'You are an expert interview coach with broad knowledge across industries. Focus on fundamental skills like communication, problem-solving, and leadership that apply universally.',
      keyFocusAreas: ['Communication', 'Problem Solving', 'Leadership', 'Teamwork', 'Adaptability', 'Critical Thinking'],
      commonQuestions: ['Behavioral questions', 'Problem-solving scenarios', 'Leadership examples', 'Team situations'],
      frameworks: ['STAR', 'CAR', 'SOAR', 'Problem-Action-Result'],
      terminology: ['Leadership', 'Teamwork', 'Problem Solving', 'Communication', 'Results', 'Innovation']
    }
  };

  static getIndustryTemplate(industry: IndustryType): IndustryPromptTemplate {
    return this.industryTemplates[industry] || this.industryTemplates.general;
  }

  static getIndustryKeywords(industry: IndustryType): string[] {
    const template = this.getIndustryTemplate(industry);
    return [...template.keyFocusAreas, ...template.terminology];
  }

  static getRecommendedFrameworks(industry: IndustryType): string[] {
    return this.getIndustryTemplate(industry).frameworks;
  }

  static buildIndustrySpecificPrompt(
    industry: IndustryType,
    interviewType: InterviewType,
    basePrompt: string
  ): string {
    const template = this.getIndustryTemplate(industry);
    
    return `${template.systemPrompt}

Industry Focus: ${industry.toUpperCase()}
Interview Type: ${interviewType.toUpperCase()}
Key Focus Areas: ${template.keyFocusAreas.join(', ')}
Recommended Frameworks: ${template.frameworks.join(', ')}

${basePrompt}

Ensure your suggestions:
- Use industry-specific terminology: ${template.terminology.join(', ')}
- Focus on key areas: ${template.keyFocusAreas.join(', ')}
- Apply appropriate frameworks for this industry
- Consider ${industry} industry best practices and expectations`;
  }
}
