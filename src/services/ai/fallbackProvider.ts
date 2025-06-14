
import { AIResponse } from './types';

export class FallbackProvider {
  static generateFallbackResponse(context: string, framework: string): AIResponse {
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
}
