
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SpeechAnalytics } from '@/services/speechService';
import { AIResponse } from '@/services/aiService';
import { SessionData, StorageSettings } from '@/types/storageTypes';

interface SessionState {
  isActive: boolean;
  isRecording: boolean;
  startTime: number;
  duration: string;
  transcript: string;
  analytics: SpeechAnalytics;
  aiSuggestion: AIResponse | null;
}

interface AppState {
  // Session state
  session: SessionState;
  
  // Application settings
  settings: StorageSettings | null;
  
  // Session history
  sessions: SessionData[];
  
  // UI state
  activeView: string;
  loading: Record<string, boolean>;
  errors: Record<string, string | null>;
  
  // Actions
  setSessionActive: (active: boolean) => void;
  setSessionRecording: (recording: boolean) => void;
  updateTranscript: (transcript: string) => void;
  updateAnalytics: (analytics: SpeechAnalytics) => void;
  updateAISuggestion: (suggestion: AIResponse | null) => void;
  setActiveView: (view: string) => void;
  setLoading: (key: string, loading: boolean) => void;
  setError: (key: string, error: string | null) => void;
  loadSettings: (settings: StorageSettings) => void;
  loadSessions: (sessions: SessionData[]) => void;
  addSession: (session: SessionData) => void;
  removeSession: (sessionId: string) => void;
  resetSession: () => void;
}

const initialSessionState: SessionState = {
  isActive: false,
  isRecording: false,
  startTime: 0,
  duration: "00:00",
  transcript: "",
  analytics: {
    wordsPerMinute: 0,
    fillerWords: 0,
    pauseDuration: 0,
    confidenceScore: 0,
    totalWords: 0,
    speakingTime: 0
  },
  aiSuggestion: null
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      session: initialSessionState,
      settings: null,
      sessions: [],
      activeView: 'dashboard',
      loading: {},
      errors: {},

      setSessionActive: (active) =>
        set((state) => ({
          session: { 
            ...state.session, 
            isActive: active,
            startTime: active ? Date.now() : state.session.startTime
          }
        })),

      setSessionRecording: (recording) =>
        set((state) => ({
          session: { ...state.session, isRecording: recording }
        })),

      updateTranscript: (transcript) =>
        set((state) => ({
          session: { ...state.session, transcript }
        })),

      updateAnalytics: (analytics) =>
        set((state) => ({
          session: { ...state.session, analytics }
        })),

      updateAISuggestion: (suggestion) =>
        set((state) => ({
          session: { ...state.session, aiSuggestion: suggestion }
        })),

      setActiveView: (view) => set({ activeView: view }),

      setLoading: (key, loading) =>
        set((state) => ({
          loading: { ...state.loading, [key]: loading }
        })),

      setError: (key, error) =>
        set((state) => ({
          errors: { ...state.errors, [key]: error }
        })),

      loadSettings: (settings) => set({ settings }),

      loadSessions: (sessions) => set({ sessions }),

      addSession: (session) =>
        set((state) => ({
          sessions: [session, ...state.sessions].slice(0, 50) // Keep last 50
        })),

      removeSession: (sessionId) =>
        set((state) => ({
          sessions: state.sessions.filter(s => s.id !== sessionId)
        })),

      resetSession: () =>
        set((state) => ({
          session: initialSessionState
        }))
    }),
    {
      name: 'candidai-store',
      partialize: (state) => ({
        settings: state.settings,
        sessions: state.sessions,
        activeView: state.activeView
      })
    }
  )
);
