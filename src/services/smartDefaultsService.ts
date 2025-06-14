import { chromeStorage } from '@/utils/chromeStorage';

interface UsagePattern {
  feature: string;
  usage: number;
  lastUsed: Date;
  effectiveness: number; // 0-1 score
}

interface UserBehavior {
  sessionCount: number;
  avgSessionDuration: number;
  preferredTone: string;
  preferredLength: string;
  commonErrors: string[];
  successfulConfigs: any[];
  usagePatterns: UsagePattern[];
}

export class SmartDefaultsService {
  private behavior: UserBehavior = {
    sessionCount: 0,
    avgSessionDuration: 0,
    preferredTone: 'professional',
    preferredLength: 'medium',
    commonErrors: [],
    successfulConfigs: [],
    usagePatterns: []
  };

  async initialize() {
    await this.loadBehaviorData();
  }

  private async loadBehaviorData() {
    try {
      const sessions = await chromeStorage.getSessionHistory();
      this.analyzeSessions(sessions);
      
      const stored = localStorage.getItem('candidai_behavior');
      if (stored) {
        this.behavior = { ...this.behavior, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.warn('Failed to load behavior data:', error);
    }
  }

  private analyzeSessions(sessions: any[]) {
    if (sessions.length === 0) return;

    this.behavior.sessionCount = sessions.length;
    this.behavior.avgSessionDuration = sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length;
    
    // Analyze common patterns
    const tones = sessions.map(s => s.responseStyle?.tone).filter(Boolean);
    this.behavior.preferredTone = this.getMostCommon(tones) || 'professional';
    
    const lengths = sessions.map(s => s.responseStyle?.length).filter(Boolean);
    this.behavior.preferredLength = this.getMostCommon(lengths) || 'medium';
  }

  private getMostCommon(arr: string[]): string | null {
    const counts = arr.reduce((acc, val) => {
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, '');
  }

  getSmartDefaults(context: 'new-user' | 'experienced' | 'specific-use-case', useCase?: string) {
    switch (context) {
      case 'new-user':
        return this.getNewUserDefaults();
      case 'experienced':
        return this.getExperiencedUserDefaults();
      case 'specific-use-case':
        return this.getUseCaseDefaults(useCase);
      default:
        return this.getAdaptiveDefaults();
    }
  }

  private getNewUserDefaults() {
    return {
      aiProvider: {
        primary: 'openai',
        models: { openai: 'gpt-4o-mini' }
      },
      responseStyle: {
        tone: 'conversational',
        length: 'detailed',
        formality: 'semiformal'
      },
      coaching: {
        enableRealtime: false, // Less overwhelming for beginners
        frameworks: ['basic'],
        experienceLevel: 'beginner'
      },
      audio: {
        confidenceThreshold: 70, // More sensitive for beginners
        fillerSensitivity: 2, // Less strict
        noiseReduction: true
      }
    };
  }

  private getExperiencedUserDefaults() {
    return {
      aiProvider: {
        primary: this.getPreferredProvider(),
        models: this.getPreferredModels()
      },
      responseStyle: {
        tone: this.behavior.preferredTone,
        length: this.behavior.preferredLength,
        formality: 'formal'
      },
      coaching: {
        enableRealtime: true,
        frameworks: ['star', 'soar'],
        experienceLevel: 'intermediate'
      },
      audio: {
        confidenceThreshold: 80,
        fillerSensitivity: 4,
        noiseReduction: false // Experienced users might prefer raw audio
      }
    };
  }

  private getUseCaseDefaults(useCase?: string) {
    const defaults = {
      interviews: {
        responseStyle: { tone: 'professional', length: 'detailed', formality: 'formal' },
        coaching: { frameworks: ['star', 'soar'] },
        audio: { confidenceThreshold: 85, fillerSensitivity: 4 }
      },
      presentations: {
        responseStyle: { tone: 'encouraging', length: 'medium', formality: 'semiformal' },
        coaching: { frameworks: ['basic'] },
        audio: { confidenceThreshold: 75, fillerSensitivity: 3 }
      },
      meetings: {
        responseStyle: { tone: 'professional', length: 'brief', formality: 'formal' },
        coaching: { frameworks: ['basic'] },
        audio: { confidenceThreshold: 80, fillerSensitivity: 3 }
      }
    };

    return defaults[useCase as keyof typeof defaults] || this.getAdaptiveDefaults();
  }

  private getAdaptiveDefaults() {
    // Use machine learning-like approach based on success patterns
    const successfulConfigs = this.behavior.successfulConfigs;
    
    if (successfulConfigs.length === 0) {
      return this.getNewUserDefaults();
    }

    // Find most successful configuration pattern
    const configScores = successfulConfigs.reduce((scores, config) => {
      const key = JSON.stringify(config);
      scores[key] = (scores[key] || 0) + 1;
      return scores;
    }, {} as Record<string, number>);

    const bestConfig = Object.keys(configScores).reduce((a, b) => 
      configScores[a] > configScores[b] ? a : b
    );

    try {
      return JSON.parse(bestConfig);
    } catch {
      return this.getExperiencedUserDefaults();
    }
  }

  private getPreferredProvider() {
    // Analyze which provider has been most successful
    const providerSuccess = this.behavior.usagePatterns
      .filter(p => p.feature.includes('provider'))
      .sort((a, b) => b.effectiveness - a.effectiveness);
    
    return providerSuccess[0]?.feature.split(':')[1] || 'openai';
  }

  private getPreferredModels() {
    return {
      openai: this.behavior.avgSessionDuration > 300 ? 'gpt-4o' : 'gpt-4o-mini',
      claude: 'claude-3-sonnet-20240229',
      gemini: 'gemini-pro'
    };
  }

  recordUsage(feature: string, effectiveness: number) {
    const existing = this.behavior.usagePatterns.find(p => p.feature === feature);
    
    if (existing) {
      existing.usage++;
      existing.lastUsed = new Date();
      existing.effectiveness = (existing.effectiveness + effectiveness) / 2;
    } else {
      this.behavior.usagePatterns.push({
        feature,
        usage: 1,
        lastUsed: new Date(),
        effectiveness
      });
    }

    this.saveBehaviorData();
  }

  recordSuccessfulConfig(config: any) {
    this.behavior.successfulConfigs.push({
      ...config,
      timestamp: new Date(),
      sessionDuration: this.behavior.avgSessionDuration
    });

    // Keep only last 50 successful configs
    if (this.behavior.successfulConfigs.length > 50) {
      this.behavior.successfulConfigs = this.behavior.successfulConfigs.slice(-50);
    }

    this.saveBehaviorData();
  }

  private async saveBehaviorData() {
    try {
      localStorage.setItem('candidai_behavior', JSON.stringify(this.behavior));
    } catch (error) {
      console.warn('Failed to save behavior data:', error);
    }
  }

  getRecommendations() {
    const recommendations = [];

    // Recommend based on usage patterns
    if (this.behavior.sessionCount > 10) {
      if (this.behavior.avgSessionDuration < 120) {
        recommendations.push({
          type: 'setting',
          title: 'Enable Real-time Coaching',
          description: 'Your sessions are short. Real-time feedback might help you practice more efficiently.',
          action: { coaching: { enableRealtime: true } }
        });
      }

      if (this.behavior.preferredTone !== 'professional' && this.behavior.sessionCount > 20) {
        recommendations.push({
          type: 'experiment',
          title: 'Try Professional Tone',
          description: 'Users with similar patterns often find professional tone more effective for interviews.',
          action: { responseStyle: { tone: 'professional' } }
        });
      }
    }

    // Recommend based on common errors
    if (this.behavior.commonErrors.includes('filler_words')) {
      recommendations.push({
        type: 'setting',
        title: 'Increase Filler Word Sensitivity',
        description: 'You often use filler words. Higher sensitivity can help you catch them better.',
        action: { audio: { fillerSensitivity: 4 } }
      });
    }

    return recommendations;
  }

  // Get personalized onboarding steps
  getPersonalizedOnboarding(userProfile: any) {
    const steps = [];

    if (userProfile.experience === 'beginner') {
      steps.push(
        'Set up your first AI provider with guided help',
        'Try a practice session with gentle feedback',
        'Review your first session results'
      );
    } else {
      steps.push(
        'Configure multiple AI providers for fallback',
        'Set up advanced coaching frameworks',
        'Enable real-time analysis features'
      );
    }

    return steps;
  }
}

export const smartDefaultsService = new SmartDefaultsService();
