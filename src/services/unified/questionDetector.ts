
export class QuestionDetector {
  private questionPatterns = [
    { pattern: /\b(tell me about a time|describe a situation|give me an example)\b/i, type: 'behavioral' as const, weight: 0.9 },
    { pattern: /\b(challenging|difficult|problem|issue|obstacle|conflict)\b/i, type: 'behavioral' as const, weight: 0.8 },
    { pattern: /\b(technical|code|algorithm|programming|technology|system|architecture)\b/i, type: 'technical' as const, weight: 0.85 },
    { pattern: /\b(what would you do|how would you handle|if you were|hypothetically)\b/i, type: 'situational' as const, weight: 0.8 },
    { pattern: /\b(what|how|why|when|where|who|can you|could you|would you)\b/i, type: 'general' as const, weight: 0.7 },
    { pattern: /\?$/, type: 'general' as const, weight: 0.9 },
    { pattern: /\b(experience with|worked on|familiar with|knowledge of)\b/i, type: 'technical' as const, weight: 0.75 }
  ];

  detectQuestion(text: string): { isQuestion: boolean; type: 'behavioral' | 'technical' | 'situational' | 'general'; confidence: number } {
    const lowerText = text.toLowerCase();
    let bestMatch: { type: 'behavioral' | 'technical' | 'situational' | 'general', confidence: number } = { type: 'general', confidence: 0 };
    let isQuestion = false;

    for (const { pattern, type, weight } of this.questionPatterns) {
      if (pattern.test(lowerText)) {
        isQuestion = true;
        const confidence = weight;
        if (confidence > bestMatch.confidence) {
          bestMatch = { type, confidence };
        }
      }
    }

    return {
      isQuestion,
      type: bestMatch.type,
      confidence: bestMatch.confidence
    };
  }

  determineUrgency(questionType: 'behavioral' | 'technical' | 'situational' | 'general', isQuestion: boolean): 'low' | 'medium' | 'high' {
    if (!isQuestion) return 'low';

    if (questionType === 'behavioral' || questionType === 'technical') {
      return 'high';
    } else if (questionType === 'situational') {
      return 'medium';
    }
    
    return 'low';
  }

  detectSpeakerChange(transcript: string): boolean {
    const speakerIndicators = [
      /\b(okay|alright|so|um|well|now)\b/i,
      /\.\.\./,
      /\b(thank you|thanks)\b/i,
      /\b(next question|moving on)\b/i
    ];
    
    return speakerIndicators.some(pattern => pattern.test(transcript));
  }
}
