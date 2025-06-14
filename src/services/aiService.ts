
import { OpenAIProvider } from './ai/providers/openaiProvider';
import { PromptBuilder } from './ai/promptBuilder';
import { FallbackProvider } from './ai/fallbackProvider';
import { AIResponse } from './ai/types';

export { AIResponse };

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

    const requestPromise = this.makeRequest(context, questionType, framework);
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

  private async makeRequest(
    context: string,
    questionType: string,
    framework: string
  ): Promise<AIResponse> {
    const prompt = PromptBuilder.buildPrompt(context, questionType, framework);
    return await this.openaiProvider.generateSuggestion(prompt, framework);
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
