
import { AISuggestion } from './suggestionTypes';

export class SuggestionAnalyzer {
  calculateConfidence(analysis: any, suggestion: string, hasDocuments: boolean): number {
    let confidence = analysis.confidence * 0.7; // Base on question detection confidence
    
    // Boost confidence if we have relevant documents
    if (hasDocuments) {
      confidence += 0.2;
    }
    
    // Adjust based on suggestion length (optimal range)
    const wordCount = suggestion.split(' ').length;
    if (wordCount >= 20 && wordCount <= 80) {
      confidence += 0.1;
    }
    
    return Math.min(confidence, 1.0);
  }

  determineSuggestionType(analysis: any, suggestion: string): 'answer' | 'clarification' | 'follow-up' {
    const lowerSuggestion = suggestion.toLowerCase();
    
    if (lowerSuggestion.includes('clarify') || lowerSuggestion.includes('could you')) {
      return 'clarification';
    }
    
    if (lowerSuggestion.includes('follow up') || lowerSuggestion.includes('additionally')) {
      return 'follow-up';
    }
    
    return 'answer';
  }
}
