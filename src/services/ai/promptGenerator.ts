
export class PromptGenerator {
  buildOptimizedPrompt(analysis: any, context: string): string {
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
}
