
export interface SpeechRecognitionConfig {
  continuous?: boolean;
  interimResults?: boolean;
  lang?: string;
}

export class SpeechRecognitionManager {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;
  private callbacks: {
    onStart?: () => void;
    onResult?: (event: SpeechRecognitionEvent) => void;
    onError?: (error: string) => void;
    onEnd?: () => void;
  } = {};

  constructor() {
    this.initializeSpeechRecognition();
  }

  private initializeSpeechRecognition() {
    try {
      const SpeechRecognitionConstructor = 
        (window as any).SpeechRecognition || 
        (window as any).webkitSpeechRecognition;
        
      if (!SpeechRecognitionConstructor) {
        console.warn('Speech Recognition not supported in this browser');
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

    this.recognition.onstart = () => {
      this.isListening = true;
      this.callbacks.onStart?.();
    };

    this.recognition.onresult = (event) => {
      this.callbacks.onResult?.(event);
    };

    this.recognition.onerror = (event) => {
      this.callbacks.onError?.(event.error);
      
      if (event.error === 'no-speech' || event.error === 'audio-capture') {
        setTimeout(() => {
          if (this.isListening) {
            this.restart();
          }
        }, 1000);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.callbacks.onEnd?.();
      
      if (this.isListening) {
        setTimeout(() => this.restart(), 100);
      }
    };
  }

  start(callbacks: typeof this.callbacks): boolean {
    if (!this.recognition) return false;
    
    this.callbacks = callbacks;
    try {
      this.recognition.start();
      return true;
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      return false;
    }
  }

  stop() {
    if (this.recognition && this.isListening) {
      this.isListening = false;
      this.recognition.stop();
    }
  }

  private restart() {
    if (this.recognition && !this.isListening) {
      try {
        this.recognition.start();
      } catch (error) {
        console.error('Failed to restart speech recognition:', error);
      }
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
