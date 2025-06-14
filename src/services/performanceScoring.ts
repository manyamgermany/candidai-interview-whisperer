
import { PerformanceMetrics, DetailedAnalytics, PerformanceReport, InterviewType, IndustryType } from '@/types/interviewTypes';
import { SpeechAnalytics, TranscriptSegment } from '@/services/speechService';

export class PerformanceScoringService {
  private fillerWords = ['um', 'uh', 'like', 'you know', 'actually', 'basically', 'literally', 'so', 'well'];
  private confidenceIndicators = {
    positive: ['confident', 'experienced', 'successfully', 'achieved', 'led', 'managed', 'delivered'],
    negative: ['maybe', 'i think', 'probably', 'not sure', 'kind of', 'sort of']
  };

  calculatePerformanceMetrics(
    transcript: string,
    speechAnalytics: SpeechAnalytics,
    segments: TranscriptSegment[],
    interviewType: InterviewType,
    industry: IndustryType
  ): PerformanceMetrics {
    const communicationScore = this.calculateCommunicationScore(speechAnalytics, transcript);
    const technicalScore = this.calculateTechnicalScore(transcript, industry);
    const leadershipScore = this.calculateLeadershipScore(transcript);
    const confidenceScore = this.calculateConfidenceScore(transcript, speechAnalytics);
    const clarityScore = this.calculateClarityScore(speechAnalytics, transcript);
    const responseRelevanceScore = this.calculateRelevanceScore(transcript, interviewType);

    const overallScore = this.calculateOverallScore({
      communicationScore,
      technicalScore,
      leadershipScore,
      confidenceScore,
      clarityScore,
      responseRelevanceScore
    }, interviewType);

    return {
      communicationScore,
      technicalScore,
      leadershipScore,
      confidenceScore,
      clarityScore,
      responseRelevanceScore,
      overallScore
    };
  }

  generateDetailedAnalytics(
    transcript: string,
    speechAnalytics: SpeechAnalytics,
    segments: TranscriptSegment[]
  ): DetailedAnalytics {
    const speakingPace = this.analyzeSpeakingPace(speechAnalytics);
    const fillerWordsAnalysis = this.analyzeFillerWords(transcript);
    const responseStructure = this.analyzeResponseStructure(transcript);
    const contentQuality = this.analyzeContentQuality(transcript);
    const confidence = this.analyzeConfidence(transcript, speechAnalytics);

    const improvements = this.generateImprovements(speakingPace, fillerWordsAnalysis, responseStructure, contentQuality, confidence);
    const strengths = this.identifyStrengths(speakingPace, fillerWordsAnalysis, responseStructure, contentQuality, confidence);

    return {
      speakingPace,
      fillerWords: fillerWordsAnalysis,
      responseStructure,
      contentQuality,
      confidence,
      improvements,
      strengths
    };
  }

  private calculateCommunicationScore(speechAnalytics: SpeechAnalytics, transcript: string): number {
    let score = 50; // Base score

    // Speaking pace (20 points)
    const wpm = speechAnalytics.wordsPerMinute || 0;
    if (wpm >= 120 && wpm <= 150) score += 20;
    else if (wpm >= 100 && wpm <= 170) score += 15;
    else if (wpm >= 80 && wpm <= 180) score += 10;

    // Filler words penalty (20 points)
    const fillerCount = this.countFillerWords(transcript);
    const wordCount = transcript.split(' ').length;
    const fillerPercentage = (fillerCount / wordCount) * 100;
    
    if (fillerPercentage < 2) score += 20;
    else if (fillerPercentage < 5) score += 15;
    else if (fillerPercentage < 10) score += 10;
    else score -= 5;

    // Clarity and coherence (10 points)
    const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = wordCount / sentences.length;
    if (avgSentenceLength >= 10 && avgSentenceLength <= 20) score += 10;
    else if (avgSentenceLength >= 8 && avgSentenceLength <= 25) score += 5;

    return Math.min(Math.max(score, 0), 100);
  }

  private calculateTechnicalScore(transcript: string, industry: IndustryType): number {
    let score = 50;
    const lowerTranscript = transcript.toLowerCase();

    // Industry-specific keywords
    const industryKeywords = this.getIndustryKeywords(industry);
    const keywordMatches = industryKeywords.filter(keyword => 
      lowerTranscript.includes(keyword.toLowerCase())
    ).length;

    score += Math.min(keywordMatches * 5, 30);

    // Technical depth indicators
    const technicalIndicators = ['implemented', 'designed', 'architected', 'optimized', 'developed', 'managed', 'led'];
    const technicalMatches = technicalIndicators.filter(indicator => 
      lowerTranscript.includes(indicator)
    ).length;

    score += Math.min(technicalMatches * 3, 20);

    return Math.min(Math.max(score, 0), 100);
  }

  private calculateLeadershipScore(transcript: string): number {
    let score = 50;
    const lowerTranscript = transcript.toLowerCase();

    const leadershipKeywords = ['led', 'managed', 'coordinated', 'mentored', 'guided', 'influenced', 'motivated', 'delegated'];
    const teamKeywords = ['team', 'collaboration', 'stakeholders', 'cross-functional', 'partnership'];

    const leadershipMatches = leadershipKeywords.filter(keyword => lowerTranscript.includes(keyword)).length;
    const teamMatches = teamKeywords.filter(keyword => lowerTranscript.includes(keyword)).length;

    score += Math.min(leadershipMatches * 5, 25);
    score += Math.min(teamMatches * 3, 25);

    return Math.min(Math.max(score, 0), 100);
  }

  private calculateConfidenceScore(transcript: string, speechAnalytics: SpeechAnalytics): number {
    let score = 50;
    const lowerTranscript = transcript.toLowerCase();

    // Positive confidence indicators
    const positiveMatches = this.confidenceIndicators.positive.filter(indicator => 
      lowerTranscript.includes(indicator)
    ).length;

    // Negative confidence indicators
    const negativeMatches = this.confidenceIndicators.negative.filter(indicator => 
      lowerTranscript.includes(indicator)
    ).length;

    score += Math.min(positiveMatches * 3, 30);
    score -= Math.min(negativeMatches * 5, 20);

    // Speech confidence from analytics
    const speechConfidence = speechAnalytics.confidenceScore || 70;
    score += (speechConfidence - 70) * 0.5;

    return Math.min(Math.max(score, 0), 100);
  }

  private calculateClarityScore(speechAnalytics: SpeechAnalytics, transcript: string): number {
    let score = 50;

    // Speech recognition confidence
    const speechConfidence = speechAnalytics.confidenceScore || 70;
    score += (speechConfidence - 70) * 0.3;

    // Sentence structure
    const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = transcript.split(' ').length / sentences.length;
    
    if (avgSentenceLength >= 10 && avgSentenceLength <= 20) score += 25;
    else if (avgSentenceLength >= 8 && avgSentenceLength <= 25) score += 15;

    // Vocabulary diversity
    const words = transcript.toLowerCase().split(' ');
    const uniqueWords = new Set(words);
    const diversity = uniqueWords.size / words.length;
    
    if (diversity > 0.7) score += 25;
    else if (diversity > 0.5) score += 15;

    return Math.min(Math.max(score, 0), 100);
  }

  private calculateRelevanceScore(transcript: string, interviewType: InterviewType): number {
    let score = 50;
    const lowerTranscript = transcript.toLowerCase();

    const typeKeywords = this.getInterviewTypeKeywords(interviewType);
    const matches = typeKeywords.filter(keyword => lowerTranscript.includes(keyword.toLowerCase())).length;

    score += Math.min(matches * 4, 50);

    return Math.min(Math.max(score, 0), 100);
  }

  private calculateOverallScore(metrics: Omit<PerformanceMetrics, 'overallScore'>, interviewType: InterviewType): number {
    const weights = this.getWeightsForInterviewType(interviewType);
    
    return Math.round(
      metrics.communicationScore * weights.communication +
      metrics.technicalScore * weights.technical +
      metrics.leadershipScore * weights.leadership +
      metrics.confidenceScore * weights.confidence +
      metrics.clarityScore * weights.clarity +
      metrics.responseRelevanceScore * weights.relevance
    );
  }

  private getWeightsForInterviewType(interviewType: InterviewType) {
    const weights = {
      technical: { communication: 0.15, technical: 0.35, leadership: 0.1, confidence: 0.15, clarity: 0.15, relevance: 0.1 },
      behavioral: { communication: 0.25, technical: 0.1, leadership: 0.25, confidence: 0.2, clarity: 0.15, relevance: 0.05 },
      managerial: { communication: 0.2, technical: 0.15, leadership: 0.3, confidence: 0.15, clarity: 0.15, relevance: 0.05 },
      executive: { communication: 0.25, technical: 0.1, leadership: 0.35, confidence: 0.15, clarity: 0.1, relevance: 0.05 },
      'sales-pitch': { communication: 0.3, technical: 0.1, leadership: 0.2, confidence: 0.25, clarity: 0.1, relevance: 0.05 },
      'client-meeting': { communication: 0.3, technical: 0.15, leadership: 0.15, confidence: 0.2, clarity: 0.15, relevance: 0.05 },
      general: { communication: 0.2, technical: 0.15, leadership: 0.2, confidence: 0.2, clarity: 0.2, relevance: 0.05 }
    };
    
    return weights[interviewType] || weights.general;
  }

  private analyzeSpeakingPace(speechAnalytics: SpeechAnalytics) {
    const wpm = speechAnalytics.wordsPerMinute || 0;
    const optimal = wpm >= 120 && wpm <= 150;
    
    let recommendation = '';
    if (wpm < 100) recommendation = 'Speak faster to maintain engagement';
    else if (wpm > 170) recommendation = 'Slow down for better clarity';
    else if (optimal) recommendation = 'Perfect pace, maintain this speed';
    else recommendation = 'Good pace, minor adjustments could help';

    return { wordsPerMinute: wpm, optimal, recommendation };
  }

  private analyzeFillerWords(transcript: string) {
    const words = transcript.toLowerCase().split(' ');
    const fillerCount = this.countFillerWords(transcript);
    const percentage = (fillerCount / words.length) * 100;
    
    const fillerTypes = this.fillerWords.filter(filler => 
      transcript.toLowerCase().includes(filler)
    );

    let recommendation = '';
    if (percentage < 2) recommendation = 'Excellent control of filler words';
    else if (percentage < 5) recommendation = 'Good control, minor improvement possible';
    else recommendation = 'Focus on reducing filler words through practice';

    return { count: fillerCount, percentage, types: fillerTypes, recommendation };
  }

  private analyzeResponseStructure(transcript: string) {
    const lowerTranscript = transcript.toLowerCase();
    const frameworks = ['star', 'situation', 'task', 'action', 'result', 'challenge', 'approach'];
    const usedFramework = frameworks.some(framework => lowerTranscript.includes(framework));
    
    const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const completeness = Math.min((sentences.length / 5) * 100, 100); // Assume 5+ sentences is complete

    let recommendation = '';
    if (usedFramework && completeness > 80) recommendation = 'Excellent structured response';
    else if (usedFramework) recommendation = 'Good structure, add more detail';
    else recommendation = 'Use frameworks like STAR for better structure';

    return { usedFramework, frameworkType: usedFramework ? 'STAR' : undefined, completeness, recommendation };
  }

  private analyzeContentQuality(transcript: string) {
    const words = transcript.split(' ');
    const relevance = Math.min((words.length / 50) * 100, 100); // Assume 50+ words shows relevance
    
    const specificityIndicators = ['specific', 'example', 'instance', 'particular', 'exactly', 'precisely'];
    const specificity = Math.min(specificityIndicators.filter(indicator => 
      transcript.toLowerCase().includes(indicator)
    ).length * 20, 100);

    const exampleIndicators = ['for example', 'such as', 'like when', 'in particular', 'specifically'];
    const examples = exampleIndicators.filter(indicator => 
      transcript.toLowerCase().includes(indicator)
    ).length;

    let recommendation = '';
    if (relevance > 80 && specificity > 60) recommendation = 'Excellent content quality with good examples';
    else if (relevance > 60) recommendation = 'Good content, add more specific examples';
    else recommendation = 'Provide more detailed and specific responses';

    return { relevance, specificity, examples, recommendation };
  }

  private analyzeConfidence(transcript: string, speechAnalytics: SpeechAnalytics) {
    const lowerTranscript = transcript.toLowerCase();
    
    const positiveIndicators = this.confidenceIndicators.positive.filter(indicator => 
      lowerTranscript.includes(indicator)
    );
    
    const negativeIndicators = this.confidenceIndicators.negative.filter(indicator => 
      lowerTranscript.includes(indicator)
    );

    const level = Math.min(Math.max(
      50 + (positiveIndicators.length * 10) - (negativeIndicators.length * 8) + 
      ((speechAnalytics.confidenceScore || 70) - 70) * 0.5, 0
    ), 100);

    const indicators = [...positiveIndicators, ...negativeIndicators.map(neg => `Avoid: ${neg}`)];

    let recommendation = '';
    if (level > 80) recommendation = 'Strong confidence displayed';
    else if (level > 60) recommendation = 'Good confidence, could be stronger';
    else recommendation = 'Focus on building confidence through preparation';

    return { level, indicators, recommendation };
  }

  private generateImprovements(speakingPace: any, fillerWords: any, responseStructure: any, contentQuality: any, confidence: any): string[] {
    const improvements: string[] = [];

    if (!speakingPace.optimal) improvements.push(speakingPace.recommendation);
    if (fillerWords.percentage > 5) improvements.push(fillerWords.recommendation);
    if (!responseStructure.usedFramework) improvements.push(responseStructure.recommendation);
    if (contentQuality.relevance < 70) improvements.push(contentQuality.recommendation);
    if (confidence.level < 70) improvements.push(confidence.recommendation);

    return improvements;
  }

  private identifyStrengths(speakingPace: any, fillerWords: any, responseStructure: any, contentQuality: any, confidence: any): string[] {
    const strengths: string[] = [];

    if (speakingPace.optimal) strengths.push('Excellent speaking pace');
    if (fillerWords.percentage < 3) strengths.push('Great control of filler words');
    if (responseStructure.usedFramework) strengths.push('Good use of structured response framework');
    if (contentQuality.relevance > 80) strengths.push('Highly relevant and detailed responses');
    if (confidence.level > 80) strengths.push('Strong confidence and conviction');

    return strengths;
  }

  private countFillerWords(transcript: string): number {
    const lowerTranscript = transcript.toLowerCase();
    return this.fillerWords.reduce((count, filler) => {
      const matches = lowerTranscript.split(new RegExp(`\\b${filler}\\b`, 'g')).length - 1;
      return count + matches;
    }, 0);
  }

  private getIndustryKeywords(industry: IndustryType): string[] {
    const keywords = {
      technology: ['API', 'database', 'algorithm', 'framework', 'architecture', 'scalability', 'performance'],
      finance: ['analysis', 'risk', 'portfolio', 'compliance', 'ROI', 'financial', 'market'],
      consulting: ['strategy', 'analysis', 'client', 'solution', 'recommendation', 'implementation'],
      healthcare: ['patient', 'care', 'safety', 'protocol', 'compliance', 'treatment', 'outcome'],
      marketing: ['campaign', 'brand', 'customer', 'conversion', 'engagement', 'ROI', 'metrics'],
      sales: ['customer', 'revenue', 'pipeline', 'conversion', 'relationship', 'closing', 'quota'],
      operations: ['process', 'efficiency', 'optimization', 'quality', 'cost', 'improvement', 'metrics'],
      product: ['user', 'feature', 'market', 'strategy', 'roadmap', 'metrics', 'feedback'],
      design: ['user', 'interface', 'experience', 'usability', 'design', 'prototype', 'testing'],
      general: ['team', 'leadership', 'project', 'goal', 'achievement', 'collaboration', 'result']
    };
    
    return keywords[industry] || keywords.general;
  }

  private getInterviewTypeKeywords(interviewType: InterviewType): string[] {
    const keywords = {
      technical: ['code', 'algorithm', 'system', 'design', 'implementation', 'architecture'],
      behavioral: ['situation', 'challenge', 'example', 'experience', 'team', 'conflict'],
      managerial: ['team', 'leadership', 'management', 'delegation', 'strategy', 'planning'],
      executive: ['vision', 'strategy', 'leadership', 'transformation', 'growth', 'stakeholder'],
      'sales-pitch': ['solution', 'value', 'benefit', 'customer', 'ROI', 'proposal'],
      'client-meeting': ['partnership', 'collaboration', 'solution', 'requirement', 'expectation'],
      general: ['experience', 'skill', 'achievement', 'goal', 'team', 'project']
    };
    
    return keywords[interviewType] || keywords.general;
  }
}

export const performanceScoringService = new PerformanceScoringService();
