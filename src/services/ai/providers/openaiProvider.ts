
import { AIResponse } from '../types';

export class OpenAIProvider {
  private apiKey = '';
  private model = 'gpt-4o-mini';
  private endpoint = 'https://api.openai.com/v1/chat/completions';

  configure(apiKey: string, model?: string) {
    this.apiKey = this.validateAndCleanApiKey(apiKey);
    if (model) this.model = model;
    console.log(`Configured OpenAI with model ${this.model}, key length: ${this.apiKey.length}`);
  }

  private validateAndCleanApiKey(apiKey: string): string {
    if (!apiKey) return '';
    
    const cleaned = apiKey.trim().replace(/\s+/g, '');
    
    if (cleaned.startsWith('sk-')) {
      if (cleaned.startsWith('sk-proj-')) {
        if (cleaned.length >= 150 && cleaned.length <= 200) {
          return cleaned;
        }
        console.warn(`Project API key length ${cleaned.length} is outside expected range (150-200)`);
        return cleaned;
      }
      
      const legacyKeyMatch = cleaned.match(/^sk-[A-Za-z0-9\-_]{48,56}/);
      if (legacyKeyMatch) {
        const extractedKey = legacyKeyMatch[0];
        if (cleaned.length > extractedKey.length * 1.5) {
          console.warn('Detected potentially duplicated legacy API key, extracting first valid key');
          return extractedKey;
        }
        return extractedKey;
      }
      
      console.warn('Unknown OpenAI API key format, but starts with sk- so attempting to use');
      return cleaned;
    }
    
    return cleaned;
  }

  async generateSuggestion(prompt: string, framework: string): Promise<AIResponse> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key is required');
    }

    if (!this.apiKey.startsWith('sk-')) {
      throw new Error('OpenAI API key must start with "sk-"');
    }

    console.log(`Making OpenAI request with ${this.apiKey.startsWith('sk-proj-') ? 'project' : 'legacy'} key length: ${this.apiKey.length}`);

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: 'You are a professional interview coach.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 150,
        temperature: 0.7,
        top_p: 0.9
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || 'Unknown error';
      
      if (errorMessage.includes('API key') || errorMessage.includes('authentication')) {
        throw new Error(`OpenAI API authentication failed: ${errorMessage}. Please check your API key.`);
      }
      
      throw new Error(`OpenAI API error: ${response.status} - ${errorMessage}`);
    }

    const data = await response.json();
    const suggestion = data.choices[0]?.message?.content || 'No suggestion available';
    
    return {
      suggestion: suggestion.trim(),
      confidence: 90,
      framework,
      reasoning: 'Generated using OpenAI GPT model'
    };
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  async test(): Promise<boolean> {
    try {
      const response = await this.generateSuggestion('This is a test message', 'star');
      return response.confidence > 0;
    } catch (error) {
      console.error('OpenAI provider test failed:', error);
      return false;
    }
  }
}
