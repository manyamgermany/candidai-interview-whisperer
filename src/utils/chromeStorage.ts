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

export const chromeStorage = {
  async getSettings(): Promise<StorageSettings> {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      const result = await chrome.storage.sync.get('candidai_settings');
      return result.candidai_settings || DEFAULT_SETTINGS;
    }
    // Fallback to localStorage for development
    const stored = localStorage.getItem('candidai_settings');
    return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
  },

  async saveSettings(settings: Partial<StorageSettings>): Promise<void> {
    const currentSettings = await this.getSettings();
    const updatedSettings = { ...currentSettings, ...settings };
    
    if (typeof chrome !== 'undefined' && chrome.storage) {
      await chrome.storage.sync.set({ candidai_settings: updatedSettings });
    } else {
      // Fallback to localStorage for development
      localStorage.setItem('candidai_settings', JSON.stringify(updatedSettings));
    }
  },

  async getSessionHistory(): Promise<any[]> {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      const result = await chrome.storage.local.get('candidai_sessions');
      return result.candidai_sessions || [];
    }
    const stored = localStorage.getItem('candidai_sessions');
    return stored ? JSON.parse(stored) : [];
  },

  async saveSession(session: any): Promise<void> {
    const sessions = await this.getSessionHistory();
    sessions.unshift(session);
    // Keep only last 50 sessions
    const limitedSessions = sessions.slice(0, 50);
    
    if (typeof chrome !== 'undefined' && chrome.storage) {
      await chrome.storage.local.set({ candidai_sessions: limitedSessions });
    } else {
      localStorage.setItem('candidai_sessions', JSON.stringify(limitedSessions));
    }
  }
};
