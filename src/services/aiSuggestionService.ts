
import { aiService } from './aiService';
import { documentStorageService } from './documentStorageService';
import { ProcessedDocument } from '@/types/documentTypes';
import { AudioAnalysis } from './unifiedAudioService';

export interface AISuggestion {
  id: string;
  suggestion: string;
  confidence: number;
  type: 'answer' | 'clarification' | 'follow-up';
  timestamp: number;
  context: string;
}

export class AISuggestionService {
  private responseCache = new Map<string, AISuggestion>();
  private debounceTimer: NodeJS.Timeout | null = null;
  private lastProcessedText = '';
  private userDocuments: ProcessedDocument[] = [];
  private contextWindow = 150; // words to include in context

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
    const cacheKey = this.generateCacheKey(analysis.transcript, analysis.questionType);
    const cached = this.responseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 300000) { // 5 minute cache
      onSuggestion(cached);
      return;
    }

    // Debounce with faster timing for high urgency
    const debounceMs = analysis.urgency === 'high' ? 300 : 500;
    
    this.debounceTimer = setTimeout(async () => {
      try {
        const suggestion = await this.processSuggestion(analysis, recentTranscript);
        if (suggestion) {
          this.responseCache.set(cacheKey, suggestion);
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
    const context = this.buildEnhancedContext(analysis, recentTranscript);
    const prompt = this.buildOptimizedPrompt(analysis, context);

    try {
      const response = await aiService.generateSuggestion(prompt, analysis.questionType);
      
      return {
        id: `suggestion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        suggestion: response.suggestion,
        confidence: this.calculateConfidence(analysis, response.suggestion),
        type: this.determineSuggestionType(analysis, response.suggestion),
        timestamp: Date.now(),
        context: context.slice(0, 100) + '...'
      };
    } catch (error) {
      console.error('Failed to generate AI response:', error);
      return null;
    }
  }

  private buildEnhancedContext(analysis: AudioAnalysis, recentTranscript: string): string {
    // Get last N words for context
    const words = recentTranscript.split(' ');
    const contextWords = words.slice(-this.contextWindow).join(' ');
    
    // Add question-specific context
    let enhancedContext = `Recent conversation: "${contextWords}"\n`;
    enhancedContext += `Current question: "${analysis.transcript}"\n`;
    enhancedContext += `Question type: ${analysis.questionType}\n`;
    
    // Add relevant document context
    if (this.userDocuments.length > 0) {
      const relevantDocs = this.findRelevantDocuments(analysis);
      if (relevantDocs.length > 0) {
        enhancedContext += `\nRelevant background from user documents:\n`;
        relevantDocs.forEach(doc => {
          enhancedContext += `- ${doc.analysisResults?.summary || doc.fileName || 'Document summary not available'}\n`;
        });
      }
    }
    
    return enhancedContext;
  }

  private findRelevantDocuments(analysis: AudioAnalysis): ProcessedDocument[] {
    const keywords = this.extractKeywords(analysis.transcript);
    
    return this.userDocuments.filter(doc => {
      const docText = (doc.analysisResults?.summary || doc.fileName || '').toLowerCase();
      return keywords.some(keyword => docText.includes(keyword.toLowerCase()));
    }).slice(0, 2); // Limit to most relevant documents
  }

  private extractKeywords(text: string): string[] {
    // Extract meaningful keywords from the question
    const words = text.toLowerCase().split(/\s+/);
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'tell', 'me', 'about', 'what', 'how', 'why', 'when', 'where', 'you', 'your', 'can', 'could', 'would', 'should'];
    
    return words.filter(word => 
      word.length > 3 && 
      !stopWords.includes(word) &&
      /^[a-zA-Z]+$/.test(word)
    );
  }

  private buildOptimizedPrompt(analysis: AudioAnalysis, context: string): string {
    const basePrompt = `You are an AI interview coach helping a candidate respond to interview questions in real-time.

${context}

Based on the above context and the candidate's background, provide a concise, helpful suggestion for how to respond to this ${analysis.questionType} question. 

Guidelines:
- Keep response under 100 words for quick reading
- Focus on key points to mention
- Use the candidate's actual experience when possible
- Match the question type (${analysis.questionType})
- Be specific and actionable

Response:`;

    return basePrompt;
  }

  private calculateConfidence(analysis: AudioAnalysis, suggestion: string): number {
    let confidence = analysis.confidence * 0.7; // Base on question detection confidence
    
    // Boost confidence if we have relevant documents
    if (this.userDocuments.length > 0) {
      confidence += 0.2;
    }
    
    // Adjust based on suggestion length (optimal range)
    const wordCount = suggestion.split(' ').length;
    if (wordCount >= 20 && wordCount <= 80) {
      confidence += 0.1;
    }
    
    return Math.min(confidence, 1.0);
  }

  private determineSuggestionType(analysis: AudioAnalysis, suggestion: string): 'answer' | 'clarification' | 'follow-up' {
    const lowerSuggestion = suggestion.toLowerCase();
    
    if (lowerSuggestion.includes('clarify') || lowerSuggestion.includes('could you')) {
      return 'clarification';
    }
    
    if (lowerSuggestion.includes('follow up') || lowerSuggestion.includes('additionally')) {
      return 'follow-up';
    }
    
    return 'answer';
  }

  private generateCacheKey(transcript: string, questionType: string): string {
    // Create a hash-like key for caching
    const normalized = transcript.toLowerCase().replace(/[^\w\s]/g, '').trim();
    return `${questionType}_${normalized.slice(0, 50)}`;
  }

  clearCache(): void {
    this.responseCache.clear();
  }

  async refreshDocuments(): Promise<void> {
    await this.loadUserDocuments();
  }
}

export const aiSuggestionService = new AISuggestionService();
