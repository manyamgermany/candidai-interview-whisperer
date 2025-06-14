
import { BaseStorageService } from './baseStorageService';
import { StorageInfo } from '@/types/chromeStorageTypes';
import { isExtensionContext, calculateStorageUsage } from '@/utils/storageHelpers';

export class StorageInfoService extends BaseStorageService {
  async getStorageInfo(): Promise<StorageInfo> {
    try {
      if (isExtensionContext()) {
        const usage = await window.chrome.storage.sync.getBytesInUse();
        return { used: usage, total: 102400 }; // Chrome sync storage limit
      }
      
      if (typeof window !== 'undefined') {
        const settings = localStorage.getItem('candidai_settings') || '';
        const sessions = localStorage.getItem('candidai_sessions') || '';
        const used = calculateStorageUsage(settings + sessions);
        return { used, total: 5242880 }; // 5MB typical localStorage limit
      }
      
      return { used: 0, total: 0 };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return { used: 0, total: 0 };
    }
  }
}

export const storageInfoService = new StorageInfoService();
