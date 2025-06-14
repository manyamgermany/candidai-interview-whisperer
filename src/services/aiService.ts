
export interface AIResponse {
  suggestion: string;
  confidence: number;
  framework?: string;
  reasoning?: string;
}

export interface AIProvider {
  name: string;
  endpoint: string;
  apiKey: string;
  model: string;
}

export class AIService {
  private providers: AIProvider[] = [];
  private currentProviderIndex = 0;

  constructor() {
    this.loadProviders();
  }

  private loadProviders() {
    // Load from environment or local storage
    const savedProviders = localStorage.getItem('ai-providers');
    if (savedProviders) {
      this.providers = JSON.parse(savedProviders);
    } else {
      // Default providers
      this.providers = [
        {
          name: 'OpenAI',
          endpoint: 'https://api.openai.com/v1/chat/completions',
          apiKey: process.env.REACT_APP_OPENAI_API_KEY || '',
          model: 'gpt-4'
        },
        {
          name: 'Anthropic',
          endpoint: 'https://api.anthropic.com/v1/messages',
          apiKey: process.env.REACT_APP_ANTHROPIC_API_KEY || '',
          model: 'claude-3-sonnet-20240229'
        }
      ];
    }
  }

  async generateSuggestion(prompt: string, questionType: string): Promise<AIResponse> {
    const provider = this.providers[this.currentProviderIndex];
    
    if (!provider || !provider.apiKey) {
      return this.getFallbackResponse(questionType);
    }

    try {
      const response = await this.callProvider(provider, prompt, questionType);
      return response;
    } catch (error) {
      console.error(`AI provider ${provider.name} failed:`, error);
      
      // Try next provider
      this.currentProviderIndex = (this.currentProviderIndex + 1) % this.providers.length;
      
      if (this.currentProviderIndex === 0) {
        // All providers failed, return fallback
        return this.getFallbackResponse(questionType);
      }
      
      return this.generateSuggestion(prompt, questionType);
    }
  }

  private async callProvider(provider: AIProvider, prompt: string, questionType: string): Promise<AIResponse> {
    if (provider.name === 'OpenAI') {
      return this.callOpenAI(provider, prompt, questionType);
    } else if (provider.name === 'Anthropic') {
      return this.callAnthropic(provider, prompt, questionType);
    }
    
    throw new Error(`Unsupported provider: ${provider.name}`);
  }

  private async callOpenAI(provider: AIProvider, prompt: string, questionType: string): Promise<AIResponse> {
    const response = await fetch(provider.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`
      },
      body: JSON.stringify({
        model: provider.model,
        messages: [
          {
            role: 'system',
            content: `You are an AI interview coach. Provide helpful, specific suggestions for ${questionType} questions. Format your response as JSON with 'suggestion', 'confidence', and 'framework' fields.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    try {
      const parsed = JSON.parse(content);
      return {
        suggestion: parsed.suggestion,
        confidence: parsed.confidence || 80,
        framework: parsed.framework || 'General'
      };
    } catch {
      return {
        suggestion: content,
        confidence: 75,
        framework: 'General'
      };
    }
  }

  private async callAnthropic(provider: AIProvider, prompt: string, questionType: string): Promise<AIResponse> {
    const response = await fetch(provider.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': provider.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: provider.model,
        max_tokens: 150,
        messages: [
          {
            role: 'user',
            content: `As an AI interview coach, provide a helpful suggestion for this ${questionType} question: ${prompt}. Respond in JSON format with 'suggestion', 'confidence', and 'framework' fields.`
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.content[0]?.text;
    
    try {
      const parsed = JSON.parse(content);
      return {
        suggestion: parsed.suggestion,
        confidence: parsed.confidence || 80,
        framework: parsed.framework || 'General'
      };
    } catch {
      return {
        suggestion: content,
        confidence: 75,
        framework: 'General'
      };
    }
  }

  private getFallbackResponse(questionType: string): AIResponse {
    const fallbacks = {
      behavioral: {
        suggestion: "Use the STAR method: describe the Situation, Task, Action, and Result from a specific example.",
        framework: "STAR"
      },
      technical: {
        suggestion: "Break down the problem step-by-step and explain your thought process clearly.",
        framework: "Problem-Solving"
      },
      situational: {
        suggestion: "Consider multiple perspectives and explain your decision-making process.",
        framework: "Decision-Making"
      },
      general: {
        suggestion: "Be specific, provide examples, and connect your answer to the role requirements.",
        framework: "General"
      }
    };

    const fallback = fallbacks[questionType as keyof typeof fallbacks] || fallbacks.general;
    
    return {
      suggestion: fallback.suggestion,
      confidence: 70,
      framework: fallback.framework
    };
  }

  updateProviders(providers: AIProvider[]) {
    this.providers = providers;
    localStorage.setItem('ai-providers', JSON.stringify(providers));
  }

  getProviders(): AIProvider[] {
    return this.providers;
  }
}

export const aiService = new AIService();
