
import { BaseStorageService } from './baseStorageService';
import { SessionData } from '@/types/chromeStorageTypes';
import { limitArraySize } from '@/utils/storageHelpers';

export class SessionStorageService extends BaseStorageService {
  private readonly SESSIONS_KEY = 'candidai_sessions';
  private readonly MAX_SESSIONS = 50;

  async getSessionHistory(): Promise<SessionData[]> {
    try {
      const sessions = await this.getFromStorage<SessionData[]>(this.SESSIONS_KEY, true);
      return sessions || [];
    } catch (error) {
      console.error('Failed to get session history:', error);
      return [];
    }
  }

  async saveSession(session: SessionData): Promise<void> {
    const sessions = await this.getSessionHistory();
    sessions.unshift(session);
    const limitedSessions = limitArraySize(sessions, this.MAX_SESSIONS);
    await this.setToStorage(this.SESSIONS_KEY, limitedSessions, true);
  }
}

export const sessionStorageService = new SessionStorageService();
