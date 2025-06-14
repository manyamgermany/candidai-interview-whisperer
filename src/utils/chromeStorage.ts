
import { settingsStorageService } from '@/services/settingsStorageService';
import { sessionStorageService } from '@/services/sessionStorageService';
import { storageInfoService } from '@/services/storageInfoService';
import { genericStorageService } from '@/services/genericStorageService';
import { BaseStorageService } from '@/services/baseStorageService';

// Re-export types for backward compatibility
export type { StorageSettings, SessionData } from '@/types/chromeStorageTypes';

// Main chromeStorage API - delegates to specialized services
class ChromeStorageAPI extends BaseStorageService {
  async getSettings() {
    return settingsStorageService.getSettings();
  }

  async saveSettings(settings: any) {
    return settingsStorageService.saveSettings(settings);
  }

  async getSessionHistory() {
    return sessionStorageService.getSessionHistory();
  }

  async saveSession(session: any) {
    return sessionStorageService.saveSession(session);
  }

  async getStorageInfo() {
    return storageInfoService.getStorageInfo();
  }

  async getItem(key: string) {
    return genericStorageService.getItem(key);
  }

  async setItem(key: string, value: any) {
    return genericStorageService.setItem(key, value);
  }

  async clearAllData() {
    return this.clearStorage();
  }
}

export const chromeStorage = new ChromeStorageAPI();
