export interface AIResponse {
  suggestion: string;
  confidence: number;
  framework?: string;
  reasoning?: string;
}

export interface AIProvider {
  name: string;
  apiKey: string;
  endpoint: string;
  model: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class AIService {
  private providers: Map<string, AIProvider> = new Map();
  private currentProvider = 'openai';
  private requestQueue: Promise<any>[] = [];
  private maxConcurrentRequests = 3;

  constructor() {
    this.setupProviders();
  }

  private setupProviders() {
    // Set up default provider configurations
    const defaultProviders = {
      openai: {
        name: 'OpenAI',
        apiKey: '',
        endpoint: 'https://api.openai.com/v1/chat/completions',
        model: 'gpt-4o-mini'
      },
      claude: {
        name: 'Anthropic Claude',
        apiKey: '',
        endpoint: 'https://api.anthropic.com/v1/messages',
        model: 'claude-3-haiku-20240307'
      },
      gemini: {
        name: 'Google Gemini',
        apiKey: '',
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
        model: 'gemini-pro'
      }
    };

    Object.entries(defaultProviders).forEach(([key, provider]) => {
      this.providers.set(key, provider);
    });
  }

  private validateAndCleanApiKey(apiKey: string): string {
    if (!apiKey) return '';
    
    // Remove any whitespace, newlines, or extra characters
    const cleaned = apiKey.trim().replace(/\s+/g, '');
    
    // OpenAI API keys validation - handle both old and new formats
    if (cleaned.startsWith('sk-')) {
      // New project-based keys start with 'sk-proj-' and are ~164 characters
      if (cleaned.startsWith('sk-proj-')) {
        if (cleaned.length >= 150 && cleaned.length <= 200) {
          return cleaned;
        }
        console.warn(`Project API key length ${cleaned.length} is outside expected range (150-200)`);
        return cleaned; // Still try to use it even if length seems off
      }
      
      // Legacy keys start with 'sk-' and are ~51 characters
      const legacyKeyMatch = cleaned.match(/^sk-[A-Za-z0-9\-_]{48,56}/);
      if (legacyKeyMatch) {
        const extractedKey = legacyKeyMatch[0];
        
        // If the cleaned key is much longer than expected, it's likely duplicated
        if (cleaned.length > extractedKey.length * 1.5) {
          console.warn('Detected potentially duplicated legacy API key, extracting first valid key');
          return extractedKey;
        }
        
        return extractedKey;
      }
      
      // If we can't match either format but it starts with sk-, try using it anyway
      console.warn('Unknown OpenAI API key format, but starts with sk- so attempting to use');
      return cleaned;
    }
    
    return cleaned;
  }

  async configure(provider: string, apiKey: string, model?: string) {
    const existingProvider = this.providers.get(provider);
    if (existingProvider) {
      // Clean and validate the API key
      const cleanedKey = this.validateAndCleanApiKey(apiKey);
      existingProvider.apiKey = cleanedKey;
      if (model) existingProvider.model = model;
      console.log(`Configured ${provider} provider with model ${existingProvider.model}, key length: ${cleanedKey.length}`);
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

    const provider = this.providers.get(this.currentProvider);
    if (!provider || !provider.apiKey) {
      return this.fallbackResponse(context, framework);
    }

    const requestPromise = this.makeRequest(provider, context, questionType, framework);
    this.requestQueue.push(requestPromise);

    try {
      const response = await requestPromise;
      return response;
    } catch (error) {
      console.error(`AI service error with ${this.currentProvider}:`, error);
      return await this.tryFallbackProviders(context, questionType, framework);
    } finally {
      // Remove completed request from queue
      const index = this.requestQueue.indexOf(requestPromise);
      if (index > -1) {
        this.requestQueue.splice(index, 1);
      }
    }
  }

  private async makeRequest(
    provider: AIProvider,
    context: string,
    questionType: string,
    framework: string
  ): Promise<AIResponse> {
    const prompt = this.buildPrompt(context, questionType, framework);
    
    switch (provider.name) {
      case 'OpenAI':
        return await this.callOpenAI(provider, prompt, framework);
      case 'Anthropic Claude':
        return await this.callClaude(provider, prompt, framework);
      case 'Google Gemini':
        return await this.callGemini(provider, prompt, framework);
      default:
        throw new Error(`Unsupported provider: ${provider.name}`);
    }
  }

  private buildPrompt(context: string, questionType: string, framework: string): string {
    const frameworks = {
      star: 'Structure your response using STAR method (Situation, Task, Action, Result)',
      soar: 'Use SOAR framework (Situation, Obstacles, Actions, Results)',
      prep: 'Apply PREP method (Point, Reason, Example, Point)',
      car: 'Use CAR framework (Challenge, Action, Result)',
      soal: 'Apply SOAL method (Situation, Objective, Action, Learning)'
    };

    const questionTypes = {
      behavioral: 'This is a behavioral interview question requiring specific examples',
      technical: 'This is a technical question requiring clear explanation',
      situational: 'This is a situational question requiring hypothetical reasoning',
      general: 'This is a general interview question'
    };

    // Get user profile data for context
    const userProfileContext = this.getUserProfileContext();

    return `You are an expert interview coach providing real-time assistance to a candidate.

Context: "${context}"
Question Type: ${questionTypes[questionType as keyof typeof questionTypes] || questionTypes.general}
Framework: ${frameworks[framework as keyof typeof frameworks] || frameworks.star}

${userProfileContext}

Provide a concise, actionable suggestion (1-2 sentences) to help the candidate respond effectively. Focus on:
1. Key points to mention based on their background
2. Structure for the response using the specified framework
3. Specific advice leveraging their skills and experience
4. How to incorporate their focus keywords naturally

Be supportive, specific, and immediately actionable. Use their actual experience and skills in your suggestions.`;
  }

  private getUserProfileContext(): string {
    try {
      // Get user profile data from localStorage
      const focusKeywords = JSON.parse(localStorage.getItem('userFocusKeywords') || '[]');
      const careerSummary = localStorage.getItem('userCareerSummary') || '';
      const currentRole = localStorage.getItem('userCurrentRole') || '';
      const keyAchievements = localStorage.getItem('userKeyAchievements') || '';
      
      // Get latest document analysis
      const documents = JSON.parse(localStorage.getItem('processedDocuments') || '[]');
      const latestDoc = documents.find((doc: any) => doc.status === 'completed' && doc.analysis);
      
      let contextStr = '';
      
      if (latestDoc?.analysis) {
        const analysis = latestDoc.analysis;
        contextStr += `\nCandidate Profile:
- Name: ${analysis.personalInfo?.name || 'Not specified'}
- Current Role: ${currentRole || 'Not specified'}
- Technical Skills: ${analysis.skills?.technical?.join(', ') || 'Not specified'}
- Soft Skills: ${analysis.skills?.soft?.join(', ') || 'Not specified'}`;

        if (analysis.experience?.length > 0) {
          contextStr += `\n- Recent Experience: ${analysis.experience[0].title} at ${analysis.experience[0].company}`;
        }
      }

      if (careerSummary) {
        contextStr += `\n- Career Summary: ${careerSummary}`;
      }

      if (keyAchievements) {
        contextStr += `\n- Key Achievements: ${keyAchievements}`;
      }

      if (focusKeywords.length > 0) {
        contextStr += `\n- Focus Keywords to Emphasize: ${focusKeywords.join(', ')}`;
      }

      return contextStr;
    } catch (error) {
      console.error('Error getting user profile context:', error);
      return '';
    }
  }

  private async callOpenAI(provider: AIProvider, prompt: string, framework: string): Promise<AIResponse> {
    // Validate API key before making request - updated for new key formats
    if (!provider.apiKey) {
      throw new Error('OpenAI API key is required');
    }

    if (!provider.apiKey.startsWith('sk-')) {
      throw new Error('OpenAI API key must start with "sk-"');
    }

    // Validate length based on key type
    if (provider.apiKey.startsWith('sk-proj-')) {
      // Project-based keys are longer
      if (provider.apiKey.length < 150 || provider.apiKey.length > 200) {
        console.warn(`Project API key length ${provider.apiKey.length} is outside typical range, but attempting to use`);
      }
    } else {
      // Legacy keys are shorter
      if (provider.apiKey.length < 48 || provider.apiKey.length > 60) {
        console.warn(`Legacy API key length ${provider.apiKey.length} is outside typical range, but attempting to use`);
      }
    }

    console.log(`Making OpenAI request with ${provider.apiKey.startsWith('sk-proj-') ? 'project' : 'legacy'} key length: ${provider.apiKey.length}`);

    const response = await fetch(provider.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: provider.model,
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

  private async callClaude(provider: AIProvider, prompt: string, framework: string): Promise<AIResponse> {
    const response = await fetch(provider.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: provider.model,
        max_tokens: 150,
        messages: [
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Claude API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const suggestion = data.content[0]?.text || 'No suggestion available';
    
    return {
      suggestion: suggestion.trim(),
      confidence: 88,
      framework,
      reasoning: 'Generated using Anthropic Claude'
    };
  }

  private async callGemini(provider: AIProvider, prompt: string, framework: string): Promise<AIResponse> {
    const response = await fetch(`${provider.endpoint}?key=${provider.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          maxOutputTokens: 150,
          temperature: 0.7
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const suggestion = data.candidates[0]?.content?.parts[0]?.text || 'No suggestion available';
    
    return {
      suggestion: suggestion.trim(),
      confidence: 85,
      framework,
      reasoning: 'Generated using Google Gemini'
    };
  }

  private async tryFallbackProviders(
    context: string, 
    questionType: string, 
    framework: string
  ): Promise<AIResponse> {
    const availableProviders = Array.from(this.providers.entries())
      .filter(([key, provider]) => key !== this.currentProvider && provider.apiKey);

    for (const [key, provider] of availableProviders) {
      try {
        console.log(`Trying fallback provider: ${key}`);
        return await this.makeRequest(provider, context, questionType, framework);
      } catch (error) {
        console.error(`Fallback provider ${key} failed:`, error);
        continue;
      }
    }

    // If all providers fail, return fallback response
    return this.fallbackResponse(context, framework);
  }

  private fallbackResponse(context: string, framework: string): AIResponse {
    const suggestions = [
      'Take a moment to structure your response clearly using the specified framework.',
      'Consider providing a specific example from your experience.',
      'Focus on quantifiable results and the impact of your actions.',
      'Remember to highlight your role and contributions clearly.',
      'Think about the key skills this question is trying to assess.',
      'Structure your answer with a clear beginning, middle, and end.'
    ];

    const contextKeywords = context.toLowerCase();
    let suggestion = suggestions[Math.floor(Math.random() * suggestions.length)];

    // Try to make it more contextual based on user profile
    try {
      const focusKeywords = JSON.parse(localStorage.getItem('userFocusKeywords') || '[]');
      const currentRole = localStorage.getItem('userCurrentRole') || '';
      
      if (focusKeywords.length > 0) {
        suggestion = `Consider mentioning your experience with ${focusKeywords[0]} and structure your response using the ${framework.toUpperCase()} method.`;
      } else if (currentRole) {
        suggestion = `Draw from your experience as ${currentRole} and provide specific examples.`;
      }
    } catch (error) {
      // Fall back to generic suggestions
    }

    // Context-based suggestions
    if (contextKeywords.includes('team') || contextKeywords.includes('collaboration')) {
      suggestion = 'Highlight your collaboration skills and specific contributions to the team.';
    } else if (contextKeywords.includes('challenge') || contextKeywords.includes('difficult')) {
      suggestion = 'Focus on the problem-solving approach and what you learned.';
    } else if (contextKeywords.includes('leadership') || contextKeywords.includes('lead')) {
      suggestion = 'Emphasize your leadership style and how you motivated others.';
    }

    return {
      suggestion,
      confidence: 60,
      framework,
      reasoning: 'Fallback response - no AI provider available'
    };
  }

  setPrimaryProvider(provider: string) {
    if (this.providers.has(provider)) {
      this.currentProvider = provider;
      console.log(`Primary provider set to: ${provider}`);
    }
  }

  getAvailableProviders(): Array<{id: string, name: string, configured: boolean}> {
    return Array.from(this.providers.entries()).map(([id, provider]) => ({
      id,
      name: provider.name,
      configured: !!provider.apiKey
    }));
  }

  getCurrentProvider(): string {
    return this.currentProvider;
  }

  async testProvider(providerId: string): Promise<boolean> {
    const provider = this.providers.get(providerId);
    if (!provider || !provider.apiKey) return false;

    try {
      const response = await this.makeRequest(
        provider,
        'This is a test message',
        'general',
        'star'
      );
      return response.confidence > 0;
    } catch (error) {
      console.error(`Provider test failed for ${providerId}:`, error);
      return false;
    }
  }
}

export const aiService = new AIService();
