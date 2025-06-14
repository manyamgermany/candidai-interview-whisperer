
import { SpeechAnalytics } from "@/services/speechService";

export const buildInterviewContext = (
  message: string,
  sessionActive: boolean,
  currentTranscript: string,
  analytics?: SpeechAnalytics
): string => {
  let context = message;
  
  if (sessionActive && currentTranscript) {
    context += `\n\nCurrent meeting context: "${currentTranscript.slice(-200)}"`;
    
    if (analytics && analytics.wordsPerMinute > 0) {
      context += `\n\nSpeaking metrics:
- Pace: ${analytics.wordsPerMinute} words/minute
- Confidence: ${Math.round(analytics.confidenceScore)}%
- Filler words: ${analytics.fillerWords}
- Total words: ${analytics.totalWords}`;
    }
  }
  
  return context;
};

export const getContextualPrompt = (userMessage: string, transcript: string): string => {
  if (transcript.length > 0) {
    return `Based on this interview conversation: "${transcript.slice(-300)}", please help with: ${userMessage}`;
  }
  return userMessage;
};
