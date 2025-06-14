
export class SpeechRecognitionManager {
  private recognition: SpeechRecognition | null = null;
  private isCapturing = false;
  private lastTranscript = '';
  private restartAttempts = 0;
  private maxRestartAttempts = 5;
  private restartDelay = 1000;
  private confidenceThreshold = 0.7;
  private callbacks: {
    onResult: (results: SpeechRecognitionEvent) => void;
    onError: (error: string) => void;
    onStatusChange: (status: string) => void;
  } | null = null;

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
    if (!this.recognition || !this.callbacks) return;

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onstart = () => {
      this.isCapturing = true;
      this.restartAttempts = 0;
      this.callbacks!.onStatusChange('capturing');
    };

    this.recognition.onresult = (event) => {
      this.callbacks!.onResult(event);
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      this.callbacks!.onError(event.error);
      
      if (event.error === 'no-speech' || event.error === 'audio-capture') {
        this.handleRestart();
      } else {
        this.callbacks!.onStatusChange('error');
      }
    };

    this.recognition.onend = () => {
      if (this.isCapturing) {
        this.handleRestart();
      } else {
        this.callbacks!.onStatusChange('stopped');
      }
    };
  }

  private handleRestart() {
    if (this.restartAttempts < this.maxRestartAttempts && this.isCapturing && this.callbacks) {
      this.restartAttempts++;
      const delay = this.restartDelay * Math.pow(2, this.restartAttempts - 1);
      
      setTimeout(() => {
        if (this.recognition && this.isCapturing) {
          try {
            this.recognition.start();
          } catch (error) {
            console.error('Failed to restart recognition:', error);
            this.callbacks!.onError('Failed to restart speech recognition');
          }
        }
      }, delay);
    }
  }

  start(callbacks: {
    onResult: (results: SpeechRecognitionEvent) => void;
    onError: (error: string) => void;
    onStatusChange: (status: string) => void;
  }): boolean {
    this.callbacks = callbacks;
    this.setupRecognition();
    
    if (this.recognition) {
      try {
        this.recognition.start();
        return true;
      } catch (error) {
        console.error('Failed to start recognition:', error);
        return false;
      }
    }
    return false;
  }

  stop() {
    this.isCapturing = false;
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  isActive(): boolean {
    return this.isCapturing;
  }

  getConfidenceThreshold(): number {
    return this.confidenceThreshold;
  }

  static isSupported(): boolean {
    return !!(
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition
    );
  }
}
