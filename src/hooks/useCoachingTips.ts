
import { useState, useEffect } from "react";
import { SpeechAnalytics } from "@/services/speechService";

export interface CoachingTip {
  id: string;
  type: 'pace' | 'clarity' | 'confidence' | 'structure' | 'filler';
  severity: 'low' | 'medium' | 'high';
  message: string;
  suggestion: string;
  timestamp: number;
}

// Configuration constants
export const COACHING_THRESHOLDS = {
  SLOW_PACE: 100,
  FAST_PACE: 180,
  HIGH_FILLER_COUNT: 3,
  HIGH_UNCERTAINTY_COUNT: 2,
  LONG_SENTENCE_WORDS: 40,
  RECENT_WORDS_COUNT: 50,
  RECENT_TEXT_WORDS: 30
} as const;

export const useCoachingTips = (
  analytics: SpeechAnalytics,
  transcript: string,
  sessionActive: boolean
) => {
  const [activeTips, setActiveTips] = useState<CoachingTip[]>([]);
  const [dismissedTips, setDismissedTips] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!sessionActive) return;

    const newTips: CoachingTip[] = [];
    const currentTime = Date.now();

    // Speaking pace coaching
    if (analytics.wordsPerMinute > 0) {
      if (analytics.wordsPerMinute < COACHING_THRESHOLDS.SLOW_PACE) {
        newTips.push({
          id: `pace-slow-${currentTime}`,
          type: 'pace',
          severity: 'medium',
          message: 'Speaking quite slowly',
          suggestion: 'Try to increase your pace slightly to maintain engagement',
          timestamp: currentTime
        });
      } else if (analytics.wordsPerMinute > COACHING_THRESHOLDS.FAST_PACE) {
        newTips.push({
          id: `pace-fast-${currentTime}`,
          type: 'pace',
          severity: 'high',
          message: 'Speaking very fast',
          suggestion: 'Slow down to ensure clarity and comprehension',
          timestamp: currentTime
        });
      }
    }

    // Filler words coaching
    const words = transcript.split(' ');
    const recentWords = words.slice(-COACHING_THRESHOLDS.RECENT_WORDS_COUNT);
    const fillerWords = ['um', 'uh', 'like', 'you know', 'actually', 'basically'];
    const fillerCount = recentWords.filter(word => 
      fillerWords.includes(word.toLowerCase().replace(/[^\w]/g, ''))
    ).length;
    
    if (fillerCount > COACHING_THRESHOLDS.HIGH_FILLER_COUNT) {
      newTips.push({
        id: `filler-${currentTime}`,
        type: 'filler',
        severity: 'medium',
        message: 'High filler word usage detected',
        suggestion: 'Take brief pauses instead of using filler words',
        timestamp: currentTime
      });
    }

    // Confidence coaching based on language patterns
    const recentText = words.slice(-COACHING_THRESHOLDS.RECENT_TEXT_WORDS).join(' ').toLowerCase();
    const uncertainWords = ['maybe', 'i think', 'probably', 'not sure', 'kind of'];
    const uncertainCount = uncertainWords.filter(word => recentText.includes(word)).length;
    
    if (uncertainCount > COACHING_THRESHOLDS.HIGH_UNCERTAINTY_COUNT) {
      newTips.push({
        id: `confidence-${currentTime}`,
        type: 'confidence',
        severity: 'medium',
        message: 'Language suggests uncertainty',
        suggestion: 'Use more definitive language to project confidence',
        timestamp: currentTime
      });
    }

    // Structure coaching
    const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length > 0) {
      const lastSentence = sentences[sentences.length - 1];
      const wordCount = lastSentence.split(' ').length;
      
      if (wordCount > COACHING_THRESHOLDS.LONG_SENTENCE_WORDS) {
        newTips.push({
          id: `structure-${currentTime}`,
          type: 'structure',
          severity: 'low',
          message: 'Very long sentence detected',
          suggestion: 'Break down complex ideas into shorter sentences',
          timestamp: currentTime
        });
      }
    }

    // Filter out dismissed tips and duplicates
    const filteredTips = newTips.filter(tip => 
      !dismissedTips.has(tip.id) && 
      !activeTips.some(existing => existing.type === tip.type && existing.severity === tip.severity)
    );

    if (filteredTips.length > 0) {
      setActiveTips(prev => [...prev.slice(-4), ...filteredTips].slice(-5)); // Keep last 5 tips
    }
  }, [analytics, transcript, sessionActive, dismissedTips, activeTips]);

  const dismissTip = (tipId: string) => {
    setDismissedTips(prev => new Set([...prev, tipId]));
    setActiveTips(prev => prev.filter(tip => tip.id !== tipId));
  };

  return {
    activeTips,
    dismissTip
  };
};
