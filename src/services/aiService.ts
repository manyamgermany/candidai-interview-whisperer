import { OpenAIProvider } from './ai/providers/openaiProvider';
import { PromptBuilder } from './ai/promptBuilder';
import { FallbackProvider } from './ai/fallbackProvider';
import { AIResponse } from './ai/types';
import { personalizedResponseService } from './personalizedResponseService';
import { performanceScoringService } from './performanceScoring';
import { IndustrySpecificModels } from './ai/industryModels';
import { InterviewType, IndustryType, PerformanceReport } from '@/types/interviewTypes';
import { SpeechAnalytics, TranscriptSegment } from './speechService';

export type { AIResponse };

export class AIService {
  private openaiProvider = new OpenAIProvider();
  private currentProvider = 'openai';
  private requestQueue: Promise<any>[] = [];
  private maxConcurrentRequests = 3;

  async configure(provider: string, apiKey: string, model?: string) {
    if (provider === 'openai') {
      this.openaiProvider.configure(apiKey, model);
      return true;
    }
    return false;
  }

  async generateSuggestion(
    context: string, 
    questionType: string = 'general',
    framework: string = 'star'
  ): Promise<AIResponse> {
    // Check if we have too many concurrent requests
    if (this.requestQueue.length >= this.maxConcurrentRequests) {
      await Promise.race(this.requestQueue);
    }

    if (!this.openaiProvider.isConfigured()) {
      return FallbackProvider.generateFallbackResponse(context, framework);
    }

    const requestPromise = this.makePersonalizedRequest(context, questionType, framework);
    this.requestQueue.push(requestPromise);

    try {
      const response = await requestPromise;
      return response;
    } catch (error) {
      console.error(`AI service error with ${this.currentProvider}:`, error);
      return FallbackProvider.generateFallbackResponse(context, framework);
    } finally {
      const index = this.requestQueue.indexOf(requestPromise);
      if (index > -1) {
        this.requestQueue.splice(index, 1);
      }
    }
  }

  private async makePersonalizedRequest(
    context: string,
    questionType: string,
    framework: string
  ): Promise<AIResponse> {
    // Get personalized prompt
    const personalizedPrompt = personalizedResponseService.generatePersonalizedResponse(
      context, 
      questionType, 
      framework
    );
    
    return await this.openaiProvider.generateSuggestion(personalizedPrompt, framework);
  }

  async generatePerformanceReport(
    transcript: string,
    speechAnalytics: SpeechAnalytics,
    segments: TranscriptSegment[],
    sessionDuration: number,
    sessionId: string
  ): Promise<PerformanceReport> {
    const userProfile = personalizedResponseService.getUserProfile();
    const interviewType: InterviewType = userProfile?.interviewType || 'general';
    const industry: IndustryType = userProfile?.targetIndustry || 'general';

    const metrics = performanceScoringService.calculatePerformanceMetrics(
      transcript,
      speechAnalytics,
      segments,
      interviewType,
      industry
    );

    const analytics = performanceScoringService.generateDetailedAnalytics(
      transcript,
      speechAnalytics,
      segments
    );

    const recommendations = this.generateRecommendations(metrics, analytics, industry);
    const nextSteps = this.generateNextSteps(metrics, interviewType);

    return {
      sessionId,
      timestamp: Date.now(),
      interviewType,
      industry,
      duration: sessionDuration,
      metrics,
      analytics,
      recommendations,
      nextSteps
    };
  }

  private generateRecommendations(metrics: any, analytics: any, industry: IndustryType): string[] {
    const recommendations: string[] = [];
    
    if (metrics.communicationScore < 70) {
      recommendations.push('Practice speaking at a steady pace and reducing filler words');
    }
    
    if (metrics.technicalScore < 70) {
      const industryKeywords = IndustrySpecificModels.getIndustryKeywords(industry);
      recommendations.push(`Incorporate more ${industry} terminology: ${industryKeywords.slice(0, 3).join(', ')}`);
    }
    
    if (metrics.leadershipScore < 70) {
      recommendations.push('Include more examples of leadership and team collaboration');
    }
    
    if (metrics.confidenceScore < 70) {
      recommendations.push('Use more assertive language and specific examples');
    }
    
    if (!analytics.responseStructure.usedFramework) {
      const frameworks = IndustrySpecificModels.getRecommendedFrameworks(industry);
      recommendations.push(`Use structured frameworks like ${frameworks[0]} for better organization`);
    }

    return recommendations;
  }

  private generateNextSteps(metrics: any, interviewType: InterviewType): string[] {
    const nextSteps: string[] = [];
    
    if (metrics.overallScore < 60) {
      nextSteps.push('Schedule additional practice sessions');
      nextSteps.push('Focus on fundamental interview skills');
    } else if (metrics.overallScore < 80) {
      nextSteps.push('Practice specific weak areas identified in the report');
      nextSteps.push('Review industry-specific examples and terminology');
    } else {
      nextSteps.push('Maintain current performance level');
      nextSteps.push('Focus on advanced techniques for your target role');
    }
    
    // Interview type specific next steps
    if (interviewType === 'technical') {
      nextSteps.push('Practice coding problems and system design');
    } else if (interviewType === 'behavioral') {
      nextSteps.push('Prepare more STAR method examples');
    } else if (interviewType === 'executive') {
      nextSteps.push('Focus on strategic thinking and vision examples');
    }

    return nextSteps;
  }

  setPrimaryProvider(provider: string) {
    if (provider === 'openai') {
      this.currentProvider = provider;
      console.log(`Primary provider set to: ${provider}`);
    }
  }

  getAvailableProviders(): Array<{id: string, name: string, configured: boolean}> {
    return [
      {
        id: 'openai',
        name: 'OpenAI',
        configured: this.openaiProvider.isConfigured()
      }
    ];
  }

  getCurrentProvider(): string {
    return this.currentProvider;
  }

  async testProvider(providerId: string): Promise<boolean> {
    if (providerId === 'openai') {
      return await this.openaiProvider.test();
    }
    return false;
  }
}

export const aiService = new AIService();
