
export interface SpeechAnalytics {
  wordsPerMinute: number;
  fillerWords: number;
  pauseDuration: number;
  confidenceScore: number;
}

export class SpeechService {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;
  private transcript = '';
  private startTime = 0;
  private wordCount = 0;
  private fillerCount = 0;
  private callbacks: {
    onTranscript?: (text: string) => void;
    onAnalytics?: (analytics: SpeechAnalytics) => void;
    onError?: (error: string) => void;
  } = {};

  private readonly FILLER_WORDS = [
    'um', 'uh', 'like', 'you know', 'so', 'actually', 'basically', 
    'literally', 'sort of', 'kind of', 'well', 'right', 'okay'
  ];

  constructor() {
    // Check for Speech Recognition support with proper typing
    const SpeechRecognitionConstructor = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;
      
    if (SpeechRecognitionConstructor) {
      this.recognition = new SpeechRecognitionConstructor();
      this.setupRecognition();
    }
  }

  private setupRecognition() {
    if (!this.recognition) return;

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onstart = () => {
      this.isListening = true;
      this.startTime = Date.now();
      console.log('Speech recognition started');
    };

    this.recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        this.transcript += finalTranscript;
        this.analyzeText(finalTranscript);
        this.callbacks.onTranscript?.(this.transcript);
      }
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      this.callbacks.onError?.(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      console.log('Speech recognition ended');
    };
  }

  private analyzeText(text: string) {
    const words = text.toLowerCase().split(/\s+/).filter(word => word.length > 0);
    this.wordCount += words.length;

    // Count filler words
    const fillers = words.filter(word => 
      this.FILLER_WORDS.includes(word.replace(/[^\w]/g, ''))
    );
    this.fillerCount += fillers.length;

    // Calculate metrics
    const timeElapsed = (Date.now() - this.startTime) / 1000 / 60; // minutes
    const wpm = timeElapsed > 0 ? Math.round(this.wordCount / timeElapsed) : 0;
    const fillerRate = this.wordCount > 0 ? (this.fillerCount / this.wordCount) * 100 : 0;
    
    // Simple confidence score based on WPM and filler rate
    let confidenceScore = 100;
    if (wpm < 120 || wpm > 160) confidenceScore -= 10;
    if (fillerRate > 5) confidenceScore -= Math.min(20, fillerRate * 2);
    confidenceScore = Math.max(0, Math.min(100, confidenceScore));

    const analytics: SpeechAnalytics = {
      wordsPerMinute: wpm,
      fillerWords: this.fillerCount,
      pauseDuration: 0, // TODO: Implement pause detection
      confidenceScore: Math.round(confidenceScore)
    };

    this.callbacks.onAnalytics?.(analytics);
  }

  startListening(callbacks: typeof this.callbacks = {}) {
    if (!this.recognition) {
      callbacks.onError?.('Speech recognition not supported');
      return;
    }

    this.callbacks = callbacks;
    this.transcript = '';
    this.wordCount = 0;
    this.fillerCount = 0;
    
    try {
      this.recognition.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      callbacks.onError?.('Failed to start speech recognition');
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  isActive() {
    return this.isListening;
  }

  getTranscript() {
    return this.transcript;
  }
}

export const speechService = new SpeechService();
