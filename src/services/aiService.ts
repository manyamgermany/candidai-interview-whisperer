
export interface AIResponse {
  suggestion: string;
  confidence: number;
  framework?: string;
}

export interface AIProvider {
  name: string;
  apiKey: string;
  endpoint: string;
}

export class AIService {
  private providers: Map<string, AIProvider> = new Map();
  private currentProvider = 'openai';

  async configure(provider: string, apiKey: string) {
    const endpoints = {
      openai: 'https://api.openai.com/v1/chat/completions',
      claude: 'https://api.anthropic.com/v1/messages',
      gemini: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'
    };

    if (endpoints[provider as keyof typeof endpoints]) {
      this.providers.set(provider, {
        name: provider,
        apiKey,
        endpoint: endpoints[provider as keyof typeof endpoints]
      });
      console.log(`Configured ${provider} provider`);
    }
  }

  async generateSuggestion(
    context: string, 
    questionType: string = 'general',
    framework: string = 'star'
  ): Promise<AIResponse> {
    const provider = this.providers.get(this.currentProvider);
    if (!provider) {
      throw new Error(`Provider ${this.currentProvider} not configured`);
    }

    try {
      const prompt = this.buildPrompt(context, questionType, framework);
      
      if (this.currentProvider === 'openai') {
        return await this.callOpenAI(provider, prompt);
      } else if (this.currentProvider === 'claude') {
        return await this.callClaude(provider, prompt);
      } else if (this.currentProvider === 'gemini') {
        return await this.callGemini(provider, prompt);
      }
      
      throw new Error('Unsupported provider');
    } catch (error) {
      console.error(`AI service error with ${this.currentProvider}:`, error);
      return await this.fallbackResponse(context, framework);
    }
  }

  private buildPrompt(context: string, questionType: string, framework: string): string {
    const frameworks = {
      star: 'Structure your response using STAR method (Situation, Task, Action, Result)',
      soar: 'Use SOAR framework (Situation, Obstacles, Actions, Results)',
      prep: 'Apply PREP method (Point, Reason, Example, Point)'
    };

    return `As an interview coach, provide a concise suggestion for this interview context:
Context: "${context}"
Question Type: ${questionType}
Framework: ${frameworks[framework as keyof typeof frameworks] || frameworks.star}

Provide a brief, actionable suggestion (max 2 sentences) to help the candidate respond effectively.`;
  }

  private async callOpenAI(provider: AIProvider, prompt: string): Promise<AIResponse> {
    const response = await fetch(provider.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      suggestion: data.choices[0]?.message?.content || 'No suggestion available',
      confidence: 85
    };
  }

  private async callClaude(provider: AIProvider, prompt: string): Promise<AIResponse> {
    // Placeholder for Claude API integration
    console.log('Claude integration pending');
    return this.fallbackResponse('', 'star');
  }

  private async callGemini(provider: AIProvider, prompt: string): Promise<AIResponse> {
    // Placeholder for Gemini API integration
    console.log('Gemini integration pending');
    return this.fallbackResponse('', 'star');
  }

  private async fallbackResponse(context: string, framework: string): Promise<AIResponse> {
    const suggestions = [
      'Take a moment to structure your response clearly before speaking.',
      'Consider providing a specific example to illustrate your point.',
      'Remember to highlight the impact or results of your actions.',
      'Focus on your role and contributions in the situation you describe.'
    ];

    return {
      suggestion: suggestions[Math.floor(Math.random() * suggestions.length)],
      confidence: 60,
      framework
    };
  }

  setPrimaryProvider(provider: string) {
    if (this.providers.has(provider)) {
      this.currentProvider = provider;
    }
  }

  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }
}

export const aiService = new AIService();
