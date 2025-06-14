
import { AISuggestion, AIResponse } from "@/types";

export class AIService {
  private apiKey: string | null = null;
  private provider: string = 'openai';
  private model: string = 'gpt-4o-mini';
  private config: any = {};

  constructor() {
    this.loadConfig();
  }

  private async loadConfig() {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      const data = await chrome.storage.local.get('aiConfig');
      if (data.aiConfig) {
        this.config = data.aiConfig;
        this.apiKey = data.aiConfig.apiKey || null;
        this.provider = data.aiConfig.provider || 'openai';
        this.model = data.aiConfig.model || 'gpt-4o-mini';
      }
    }
  }

  async generateSuggestion(
    context: string,
    questionType: string = 'general',
    framework?: string
  ): Promise<AISuggestion> {
    console.log(`Generating AI suggestion for question type: ${questionType} with context: ${context}`);

    // Mock response for demonstration
    const mockSuggestion: AISuggestion = {
      id: `suggestion_${Date.now()}`,
      suggestion: `Based on the context, consider using the ${framework || 'STAR'} method to structure your response. Focus on providing specific examples and quantifiable results.`,
      confidence: 75,
      type: 'answer',
      timestamp: Date.now(),
      context: context.slice(0, 100),
      framework: framework || 'STAR'
    };

    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockSuggestion;
  }

  async configure(provider: string, apiKey?: string): Promise<void> {
    console.log('Configuring AI service with:', provider);
    const config = { provider, apiKey };
    this.provider = provider;
    this.apiKey = apiKey || null;
    
    // Store configuration
    if (typeof chrome !== 'undefined' && chrome.storage) {
      await chrome.storage.local.set({ aiConfig: config });
    }
  }

  async testProvider(provider: string): Promise<boolean> {
    console.log('Testing AI provider:', provider);
    try {
      // Mock test - in real implementation would test actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      return Math.random() > 0.3; // 70% success rate for demo
    } catch (error) {
      return false;
    }
  }

  getProviders(): string[] {
    return ['openai', 'anthropic', 'google'];
  }
}

export const aiService = new AIService();
export type { AISuggestion, AIResponse };
