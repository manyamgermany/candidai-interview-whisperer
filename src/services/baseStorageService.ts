
import { isExtensionContext, createStorageError } from '@/utils/storageHelpers';

export class BaseStorageService {
  protected async getStorageArea(useLocal: boolean = false) {
    if (isExtensionContext()) {
      return useLocal ? window.chrome.storage.local : window.chrome.storage.sync;
    }
    return null;
  }

  protected async getFromStorage<T>(key: string, useLocal: boolean = false): Promise<T | null> {
    try {
      if (isExtensionContext()) {
        const storage = await this.getStorageArea(useLocal);
        if (storage) {
          const result = await storage.get(key);
          return result[key] || null;
        }
      }
      
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : null;
      }
      
      return null;
    } catch (error) {
      console.error(`Failed to get ${key}:`, error);
      throw createStorageError(`get ${key}`, error);
    }
  }

  protected async setToStorage<T>(key: string, value: T, useLocal: boolean = false): Promise<void> {
    try {
      if (isExtensionContext()) {
        const storage = await this.getStorageArea(useLocal);
        if (storage) {
          await storage.set({ [key]: value });
          return;
        }
      }
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(`Failed to set ${key}:`, error);
      throw createStorageError(`set ${key}`, error);
    }
  }

  protected async clearStorage(): Promise<void> {
    try {
      if (isExtensionContext()) {
        await window.chrome.storage.sync.clear();
        await window.chrome.storage.local.clear();
      } else if (typeof window !== 'undefined') {
        localStorage.clear();
      }
    } catch (error) {
      console.error('Failed to clear storage:', error);
      throw createStorageError('clear storage', error);
    }
  }
}
