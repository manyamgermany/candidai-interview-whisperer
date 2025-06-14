
import { AISuggestion } from './suggestionTypes';

export class SuggestionCache {
  private cache = new Map<string, AISuggestion>();
  private cacheTimeout = 300000; // 5 minutes

  get(key: string): AISuggestion | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached;
    }
    return null;
  }

  set(key: string, suggestion: AISuggestion): void {
    this.cache.set(key, suggestion);
  }

  generateKey(transcript: string, questionType: string): string {
    const normalized = transcript.toLowerCase().replace(/[^\w\s]/g, '').trim();
    return `${questionType}_${normalized.slice(0, 50)}`;
  }

  clear(): void {
    this.cache.clear();
  }
}
