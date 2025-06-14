
import { SpeechRecognitionCallbacks } from './audioTypes';

export class SpeechRecognitionService {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;
  private lastTranscript = '';
  private callbacks: SpeechRecognitionCallbacks | null = null;

  constructor() {
    this.initializeSpeechRecognition();
  }

  private initializeSpeechRecognition() {
    try {
      const SpeechRecognitionConstructor = 
        (window as any).SpeechRecognition || 
        (window as any).webkitSpeechRecognition;
        
      if (!SpeechRecognitionConstructor) {
        console.warn('Speech Recognition not supported');
        return;
      }

      this.recognition = new SpeechRecognitionConstructor();
      this.setupRecognition();
    } catch (error) {
      console.error('Failed to initialize speech recognition:', error);
    }
  }

  private setupRecognition() {
    if (!this.recognition) return;

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event) => {
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        }
      }

      if (finalTranscript && finalTranscript !== this.lastTranscript) {
        this.lastTranscript = finalTranscript;
        this.callbacks?.onResult(finalTranscript);
      }
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      this.callbacks?.onError(event.error);
    };

    this.recognition.onend = () => {
      this.callbacks?.onEnd();
      if (this.isListening) {
        // Auto-restart if we should still be capturing
        setTimeout(() => {
          if (this.recognition && this.isListening) {
            this.recognition.start();
          }
        }, 100);
      }
    };
  }

  start(callbacks: SpeechRecognitionCallbacks): boolean {
    if (!this.recognition) return false;
    
    this.callbacks = callbacks;
    this.isListening = true;
    
    try {
      this.recognition.start();
      return true;
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      return false;
    }
  }

  stop() {
    this.isListening = false;
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  isActive(): boolean {
    return this.isListening;
  }

  static isSupported(): boolean {
    return !!(
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition
    );
  }
}
