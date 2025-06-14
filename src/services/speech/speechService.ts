import { SpeechRecognitionManager } from './speechRecognition';
import { SpeechAnalyticsCalculator, SpeechAnalytics, TranscriptSegment } from './speechAnalytics';

export type { SpeechAnalytics, TranscriptSegment };

export class SpeechService {
  private recognitionManager: SpeechRecognitionManager;
  private analyticsCalculator: SpeechAnalyticsCalculator;
  private transcript = '';
  private callbacks: {
    onTranscript?: (text: string, segments: TranscriptSegment[]) => void;
    onAnalytics?: (analytics: SpeechAnalytics) => void;
    onError?: (error: string) => void;
    onStatusChange?: (status: 'listening' | 'stopped' | 'error') => void;
  } = {};

  constructor() {
    this.recognitionManager = new SpeechRecognitionManager();
    this.analyticsCalculator = new SpeechAnalyticsCalculator();
  }

  async startListening(callbacks: typeof this.callbacks = {}): Promise<boolean> {
    if (!SpeechRecognitionManager.isSupported()) {
      callbacks.onError?.('Speech recognition not supported in this browser');
      return false;
    }

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (error) {
      callbacks.onError?.('Microphone access denied');
      return false;
    }

    this.callbacks = callbacks;
    this.reset();
    
    return this.recognitionManager.start({
      onStart: () => {
        this.callbacks.onStatusChange?.('listening');
      },
      onResult: (event) => {
        this.processResults(event);
      },
      onError: (error) => {
        this.callbacks.onError?.(error);
        this.callbacks.onStatusChange?.('error');
      },
      onEnd: () => {
        this.callbacks.onStatusChange?.('stopped');
      }
    });
  }

  private processResults(event: SpeechRecognitionEvent) {
    let finalTranscript = '';
    const currentTime = Date.now();

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence;

      if (result.isFinal) {
        finalTranscript += transcript;
        
        const segment: TranscriptSegment = {
          text: transcript,
          timestamp: currentTime,
          confidence: confidence || 0.8,
          isFinal: true
        };
        
        this.analyticsCalculator.addSegment(segment);
      }
    }

    if (finalTranscript) {
      this.transcript += finalTranscript;
      this.callbacks.onTranscript?.(this.transcript, this.analyticsCalculator.getSegments());
      this.callbacks.onAnalytics?.(this.analyticsCalculator.getCurrentAnalytics());
    }
  }

  stopListening() {
    this.recognitionManager.stop();
  }

  private reset() {
    this.transcript = '';
    this.analyticsCalculator.reset();
  }

  isActive(): boolean {
    return this.recognitionManager.isActive();
  }

  getTranscript(): string {
    return this.transcript;
  }

  getSegments(): TranscriptSegment[] {
    return this.analyticsCalculator.getSegments();
  }

  getCurrentAnalytics(): SpeechAnalytics | null {
    return this.analyticsCalculator.getCurrentAnalytics();
  }

  static isSupported(): boolean {
    return SpeechRecognitionManager.isSupported();
  }
}

export const speechService = new SpeechService();
