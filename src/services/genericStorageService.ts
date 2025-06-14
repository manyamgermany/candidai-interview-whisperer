
import { BaseStorageService } from './baseStorageService';

export class GenericStorageService extends BaseStorageService {
  async getItem<T>(key: string): Promise<T | null> {
    return this.getFromStorage<T>(key, true);
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    await this.setToStorage(key, value, true);
  }
}

export const genericStorageService = new GenericStorageService();
