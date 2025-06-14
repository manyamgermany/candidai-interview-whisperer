
import { BaseStorageService } from './baseStorageService';
import { StorageSettings } from '@/types/chromeStorageTypes';

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

export class SettingsStorageService extends BaseStorageService {
  private readonly SETTINGS_KEY = 'candidai_settings';

  async getSettings(): Promise<StorageSettings> {
    try {
      const settings = await this.getFromStorage<StorageSettings>(this.SETTINGS_KEY);
      return settings || DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Failed to get settings:', error);
      return DEFAULT_SETTINGS;
    }
  }

  async saveSettings(settings: Partial<StorageSettings>): Promise<void> {
    const currentSettings = await this.getSettings();
    const updatedSettings = { ...currentSettings, ...settings };
    await this.setToStorage(this.SETTINGS_KEY, updatedSettings);
  }
}

export const settingsStorageService = new SettingsStorageService();
