
import { smartDefaultsService } from "@/services/smartDefaultsService";

export const getDefaultSettings = (isFirstTime: boolean = false) => {
  if (isFirstTime) {
    return smartDefaultsService.getSmartDefaults('new-user');
  }

  return {
    aiProvider: {
      primary: "openai",
      openaiKey: '',
      claudeKey: '',
      geminiKey: '',
      models: {
        openai: 'gpt-4o-mini',
        claude: 'claude-3-haiku-20240307',
        gemini: 'gemini-pro'
      }
    },
    responseStyle: {
      tone: "professional",
      length: 'medium',
      formality: 'formal'
    },
    audio: {
      inputDevice: 'default',
      outputDevice: 'default',
      noiseReduction: false,
      autoGainControl: true,
      confidenceThreshold: 75,
      fillerSensitivity: 3
    },
    coaching: {
      enableRealtime: true,
      frameworks: ['star', 'soar'],
      experienceLevel: 'mid'
    },
    analytics: {
      enableTracking: false,
      trackWPM: true,
      trackFillers: true,
      trackConfidence: true
    },
    privacy: {
      localDataProcessing: true,
      sessionRecording: true
    }
  };
};
