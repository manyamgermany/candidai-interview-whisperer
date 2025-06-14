
import { StorageSettings, SessionData, AIConfig } from '@/types/storageTypes';
import { AppErrorClass } from '@/types/errorTypes';

class StorageService {
  private readonly SETTINGS_KEY = 'app_settings';
  private readonly SESSIONS_KEY = 'app_sessions';

  private handleStorageError(operation: string, error: unknown): never {
    const message = error instanceof Error ? error.message : 'Unknown storage error';
    throw new AppErrorClass(
      'STORAGE_ERROR',
      `Failed to ${operation}: ${message}`,
      'high',
      'StorageService'
    );
  }

  async getSettings(): Promise<StorageSettings> {
    try {
      const stored = localStorage.getItem(this.SETTINGS_KEY);
      if (stored) {
        return JSON.parse(stored) as StorageSettings;
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }

    // Return default settings
    return {
      aiConfig: {
        provider: 'fallback',
        model: 'gpt-4o-mini',
        temperature: 0.7,
        maxTokens: 150,
        industryFocus: 'general',
        responseStyle: 'balanced',
        enablePersonalization: true,
        enableIndustryModels: true
      },
      audioSettings: {
        microphoneEnabled: true,
        noiseReduction: true,
        autoGainControl: true
      },
      privacySettings: {
        storeTranscripts: true,
        shareAnalytics: false,
        autoDelete: false
      }
    };
  }

  async saveSettings(settings: Partial<StorageSettings>): Promise<void> {
    try {
      const currentSettings = await this.getSettings();
      const updatedSettings = { ...currentSettings, ...settings };
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(updatedSettings));
    } catch (error) {
      this.handleStorageError('save settings', error);
    }
  }

  async getAllSessions(): Promise<SessionData[]> {
    try {
      const stored = localStorage.getItem(this.SESSIONS_KEY);
      if (stored) {
        const sessions = JSON.parse(stored) as SessionData[];
        // Validate session data structure
        return sessions.filter(session => 
          session.id && 
          session.date && 
          session.analytics && 
          session.performance
        );
      }
    } catch (error) {
      this.handleStorageError('load sessions', error);
    }
    return [];
  }

  async saveSession(session: SessionData): Promise<void> {
    try {
      const sessions = await this.getAllSessions();
      const updatedSessions = [session, ...sessions.slice(0, 49)]; // Keep last 50 sessions
      localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(updatedSessions));
    } catch (error) {
      this.handleStorageError('save session', error);
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    try {
      const sessions = await this.getAllSessions();
      const filteredSessions = sessions.filter(s => s.id !== sessionId);
      localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(filteredSessions));
    } catch (error) {
      this.handleStorageError('delete session', error);
    }
  }

  async clearAllData(): Promise<void> {
    try {
      localStorage.removeItem(this.SETTINGS_KEY);
      localStorage.removeItem(this.SESSIONS_KEY);
    } catch (error) {
      this.handleStorageError('clear data', error);
    }
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      this.handleStorageError(`set item ${key}`, error);
    }
  }

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) as T : null;
    } catch (error) {
      console.error(`Failed to get item ${key}:`, error);
      return null;
    }
  }

  // Cache management
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  async getCachedItem<T>(key: string, ttl: number = 5 * 60 * 1000): Promise<T | null> {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data as T;
    }
    
    const item = await this.getItem<T>(key);
    if (item) {
      this.cache.set(key, { data: item, timestamp: Date.now(), ttl });
    }
    return item;
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const storageService = new StorageService();
