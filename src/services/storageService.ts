
import { StorageSettings, SessionData, AIConfig } from '@/types/storageTypes';

class StorageService {
  private readonly SETTINGS_KEY = 'app_settings';
  private readonly SESSIONS_KEY = 'app_sessions';

  async getSettings(): Promise<StorageSettings> {
    try {
      const stored = localStorage.getItem(this.SETTINGS_KEY);
      if (stored) {
        return JSON.parse(stored);
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
      console.error('Failed to save settings:', error);
      throw error;
    }
  }

  async getAllSessions(): Promise<SessionData[]> {
    try {
      const stored = localStorage.getItem(this.SESSIONS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
    return [];
  }

  async saveSession(session: SessionData): Promise<void> {
    try {
      const sessions = await this.getAllSessions();
      const updatedSessions = [session, ...sessions.slice(0, 49)]; // Keep last 50 sessions
      localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(updatedSessions));
    } catch (error) {
      console.error('Failed to save session:', error);
      throw error;
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    try {
      const sessions = await this.getAllSessions();
      const filteredSessions = sessions.filter(s => s.id !== sessionId);
      localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(filteredSessions));
    } catch (error) {
      console.error('Failed to delete session:', error);
      throw error;
    }
  }

  async clearAllData(): Promise<void> {
    try {
      localStorage.removeItem(this.SETTINGS_KEY);
      localStorage.removeItem(this.SESSIONS_KEY);
    } catch (error) {
      console.error('Failed to clear data:', error);
      throw error;
    }
  }

  async setItem(key: string, value: any): Promise<void> {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to set item:', error);
      throw error;
    }
  }

  async getItem(key: string): Promise<any> {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Failed to get item:', error);
      return null;
    }
  }
}

export const storageService = new StorageService();
