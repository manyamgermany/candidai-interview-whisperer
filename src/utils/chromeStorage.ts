
// Chrome Storage utilities for settings persistence
export interface StorageSettings {
  aiProvider: {
    primary: string;
    openaiKey?: string;
    claudeKey?: string;
    geminiKey?: string;
  };
  responseStyle: {
    tone: string;
    length: string;
    formality: string;
  };
  audio: {
    inputDevice: string;
    outputDevice: string;
    noiseReduction: boolean;
    autoGainControl: boolean;
  };
  coaching: {
    enableRealtime: boolean;
    frameworks: string[];
    experienceLevel: string;
  };
  analytics: {
    enableTracking: boolean;
    trackWPM: boolean;
    trackFillers: boolean;
    trackConfidence: boolean;
  };
}

export interface SessionData {
  id: string;
  timestamp: number;
  platform: string;
  duration: number;
  transcript: string;
  analytics: {
    wordsPerMinute: number;
    fillerWords: number;
    confidenceScore: number;
  };
  suggestions: string[];
}

const DEFAULT_SETTINGS: StorageSettings = {
  aiProvider: {
    primary: 'openai'
  },
  responseStyle: {
    tone: 'professional',
    length: 'medium',
    formality: 'formal'
  },
  audio: {
    inputDevice: 'default',
    outputDevice: 'default',
    noiseReduction: true,
    autoGainControl: true
  },
  coaching: {
    enableRealtime: true,
    frameworks: ['star', 'soar'],
    experienceLevel: 'mid'
  },
  analytics: {
    enableTracking: true,
    trackWPM: true,
    trackFillers: true,
    trackConfidence: true
  }
};

// Check if we're in a Chrome extension context
const isExtensionContext = (): boolean => {
  return typeof window !== 'undefined' && 
         window.chrome && 
         window.chrome.storage && 
         window.chrome.runtime && 
         typeof window.chrome.runtime.id !== 'undefined';
};

export const chromeStorage = {
  async getSettings(): Promise<StorageSettings> {
    try {
      if (isExtensionContext()) {
        const result = await window.chrome.storage.sync.get('candidai_settings');
        return result.candidai_settings || DEFAULT_SETTINGS;
      }
      
      // Fallback to localStorage for development/web version
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('candidai_settings');
        return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
      }
      
      return DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Failed to get settings:', error);
      return DEFAULT_SETTINGS;
    }
  },

  async saveSettings(settings: Partial<StorageSettings>): Promise<void> {
    try {
      const currentSettings = await this.getSettings();
      const updatedSettings = { ...currentSettings, ...settings };
      
      if (isExtensionContext()) {
        await window.chrome.storage.sync.set({ candidai_settings: updatedSettings });
      } else if (typeof window !== 'undefined') {
        localStorage.setItem('candidai_settings', JSON.stringify(updatedSettings));
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw new Error('Settings could not be saved');
    }
  },

  async getSessionHistory(): Promise<SessionData[]> {
    try {
      if (isExtensionContext()) {
        const result = await window.chrome.storage.local.get('candidai_sessions');
        return result.candidai_sessions || [];
      }
      
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('candidai_sessions');
        return stored ? JSON.parse(stored) : [];
      }
      
      return [];
    } catch (error) {
      console.error('Failed to get session history:', error);
      return [];
    }
  },

  async saveSession(session: SessionData): Promise<void> {
    try {
      const sessions = await this.getSessionHistory();
      sessions.unshift(session);
      
      // Keep only last 50 sessions to prevent storage bloat
      const limitedSessions = sessions.slice(0, 50);
      
      if (isExtensionContext()) {
        await window.chrome.storage.local.set({ candidai_sessions: limitedSessions });
      } else if (typeof window !== 'undefined') {
        localStorage.setItem('candidai_sessions', JSON.stringify(limitedSessions));
      }
    } catch (error) {
      console.error('Failed to save session:', error);
      throw new Error('Session could not be saved');
    }
  },

  async clearAllData(): Promise<void> {
    try {
      if (isExtensionContext()) {
        await window.chrome.storage.sync.clear();
        await window.chrome.storage.local.clear();
      } else if (typeof window !== 'undefined') {
        localStorage.removeItem('candidai_settings');
        localStorage.removeItem('candidai_sessions');
      }
    } catch (error) {
      console.error('Failed to clear data:', error);
      throw new Error('Data could not be cleared');
    }
  },

  // Get storage usage information
  async getStorageInfo(): Promise<{ used: number; total: number }> {
    try {
      if (isExtensionContext()) {
        const usage = await window.chrome.storage.sync.getBytesInUse();
        return { used: usage, total: 102400 }; // Chrome sync storage limit
      }
      
      // Estimate localStorage usage
      if (typeof window !== 'undefined') {
        const settings = localStorage.getItem('candidai_settings') || '';
        const sessions = localStorage.getItem('candidai_sessions') || '';
        const used = (settings.length + sessions.length) * 2; // Rough estimate
        return { used, total: 5242880 }; // 5MB typical localStorage limit
      }
      
      return { used: 0, total: 0 };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return { used: 0, total: 0 };
    }
  },

  // Generic storage methods for documents
  async getItem(key: string): Promise<any> {
    try {
      if (isExtensionContext()) {
        const result = await window.chrome.storage.local.get(key);
        return result[key];
      }
      
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : null;
      }
      
      return null;
    } catch (error) {
      console.error(`Failed to get item ${key}:`, error);
      return null;
    }
  },

  async setItem(key: string, value: any): Promise<void> {
    try {
      if (isExtensionContext()) {
        await window.chrome.storage.local.set({ [key]: value });
      } else if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(`Failed to set item ${key}:`, error);
      throw new Error(`Item ${key} could not be saved`);
    }
  }
};
