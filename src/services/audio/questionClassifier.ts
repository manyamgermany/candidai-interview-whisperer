
export class QuestionClassifier {
  private questionPatterns = [
    /\b(what|how|why|when|where|who|can you|could you|would you|tell me|describe|explain)\b/i,
    /\?$/,
    /\b(experience with|worked on|familiar with|knowledge of)\b/i,
    /\b(challenging|difficult|problem|issue|obstacle)\b/i
  ];

  detectQuestion(transcript: string): boolean {
    return this.questionPatterns.some(pattern => pattern.test(transcript));
  }

  classifyQuestionType(transcript: string): 'behavioral' | 'technical' | 'situational' | 'general' {
    const text = transcript.toLowerCase();
    
    if (text.includes('tell me about a time') || text.includes('describe a situation') || 
        text.includes('give me an example') || text.includes('challenging') || 
        text.includes('difficult')) {
      return 'behavioral';
    }
    
    if (text.includes('technical') || text.includes('code') || text.includes('algorithm') ||
        text.includes('programming') || text.includes('technology') || text.includes('system')) {
      return 'technical';
    }
    
    if (text.includes('what would you do') || text.includes('how would you handle') ||
        text.includes('if you were') || text.includes('hypothetically')) {
      return 'situational';
    }
    
    return 'general';
  }

  detectSpeakerChange(transcript: string): boolean {
    // Simple heuristic: if there's a significant pause or change in speaking pattern
    // This is a simplified implementation - could be enhanced with voice analysis
    return transcript.includes('...') || transcript.includes('um,') || transcript.includes('so,');
  }
}
