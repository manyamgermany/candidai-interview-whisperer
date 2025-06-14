
import { aiService } from './aiService';
import { documentStorageService } from './documentStorageService';
import { ProcessedDocument } from '@/types/documentTypes';
import { AudioAnalysis } from './unifiedAudioService';
import { AISuggestion } from './ai/suggestionTypes';
import { SuggestionCache } from './ai/suggestionCache';
import { ContextBuilder } from './ai/contextBuilder';
import { PromptGenerator } from './ai/promptGenerator';
import { SuggestionAnalyzer } from './ai/suggestionAnalyzer';

export { AISuggestion };

export class AISuggestionService {
  private cache = new SuggestionCache();
  private contextBuilder = new ContextBuilder();
  private promptGenerator = new PromptGenerator();
  private analyzer = new SuggestionAnalyzer();
  private debounceTimer: NodeJS.Timeout | null = null;
  private lastProcessedText = '';
  private userDocuments: ProcessedDocument[] = [];

  constructor() {
    this.loadUserDocuments();
  }

  private async loadUserDocuments() {
    try {
      this.userDocuments = await documentStorageService.getDocuments();
      console.log('Loaded user documents for AI context:', this.userDocuments.length);
    } catch (error) {
      console.error('Failed to load user documents:', error);
    }
  }

  async generateSuggestion(
    analysis: AudioAnalysis,
    recentTranscript: string,
    onSuggestion: (suggestion: AISuggestion) => void,
    onError: (error: string) => void
  ): Promise<void> {
    // Clear existing timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Only process questions with medium or high urgency
    if (!analysis.isQuestion || analysis.urgency === 'low') {
      return;
    }

    // Check cache first
    const cacheKey = this.cache.generateKey(analysis.transcript, analysis.questionType);
    const cached = this.cache.get(cacheKey);
    if (cached) {
      onSuggestion(cached);
      return;
    }

    // Debounce with faster timing for high urgency
    const debounceMs = analysis.urgency === 'high' ? 300 : 500;
    
    this.debounceTimer = setTimeout(async () => {
      try {
        const suggestion = await this.processSuggestion(analysis, recentTranscript);
        if (suggestion) {
          this.cache.set(cacheKey, suggestion);
          onSuggestion(suggestion);
        }
      } catch (error) {
        console.error('AI suggestion error:', error);
        onError('Failed to generate AI suggestion');
      }
    }, debounceMs);
  }

  private async processSuggestion(
    analysis: AudioAnalysis,
    recentTranscript: string
  ): Promise<AISuggestion | null> {
    // Skip if we've already processed this text
    if (analysis.transcript === this.lastProcessedText) {
      return null;
    }
    this.lastProcessedText = analysis.transcript;

    // Build enhanced context
    const context = this.contextBuilder.buildEnhancedContext(analysis, recentTranscript, this.userDocuments);
    const prompt = this.promptGenerator.buildOptimizedPrompt(analysis, context);

    try {
      const response = await aiService.generateSuggestion(prompt, analysis.questionType);
      
      return {
        id: `suggestion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        suggestion: response.suggestion,
        confidence: this.analyzer.calculateConfidence(analysis, response.suggestion, this.userDocuments.length > 0),
        type: this.analyzer.determineSuggestionType(analysis, response.suggestion),
        timestamp: Date.now(),
        context: context.slice(0, 100) + '...'
      };
    } catch (error) {
      console.error('Failed to generate AI response:', error);
      return null;
    }
  }

  clearCache(): void {
    this.cache.clear();
  }

  async refreshDocuments(): Promise<void> {
    await this.loadUserDocuments();
  }
}

export const aiSuggestionService = new AISuggestionService();
