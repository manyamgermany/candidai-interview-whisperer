
export interface AudioAnalysis {
  transcript: string;
  isQuestion: boolean;
  questionType: 'behavioral' | 'technical' | 'situational' | 'general';
  confidence: number;
  speakerChange: boolean;
}

export interface MeetingAudioConfig {
  onTranscript: (analysis: AudioAnalysis) => void;
  onError: (error: string) => void;
  onStatusChange: (status: 'capturing' | 'stopped' | 'error') => void;
}

export interface SpeechRecognitionCallbacks {
  onResult: (transcript: string) => void;
  onError: (error: string) => void;
  onEnd: () => void;
}
