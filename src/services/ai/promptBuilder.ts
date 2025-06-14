
export class PromptBuilder {
  static buildPrompt(context: string, questionType: string, framework: string): string {
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

  private static getUserProfileContext(): string {
    try {
      const focusKeywords = JSON.parse(localStorage.getItem('userFocusKeywords') || '[]');
      const careerSummary = localStorage.getItem('userCareerSummary') || '';
      const currentRole = localStorage.getItem('userCurrentRole') || '';
      const keyAchievements = localStorage.getItem('userKeyAchievements') || '';
      
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
}
