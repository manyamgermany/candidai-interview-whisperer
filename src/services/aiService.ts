import { AISuggestion } from "@/types";

export class AIService {
  private apiKey: string | null = null;
  private provider: string = 'openai';
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
      text: `Based on the context, consider using the ${framework || 'STAR'} method.`,
      framework: framework || 'STAR',
      confidence: 75
    };

    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockSuggestion;
  }

  async configure(config: any): Promise<void> {
    console.log('Configuring AI service with:', config);
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
