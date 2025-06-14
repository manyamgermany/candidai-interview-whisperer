export interface SpeechAnalytics {
  wordsPerMinute: number;
  fillerWords: number;
  pauseDuration: number;
  confidenceScore: number;
  totalWords: number;
  speakingTime: number;
}

export interface TranscriptSegment {
  text: string;
  timestamp: number;
  confidence: number;
  isFinal: boolean;
}

export class SpeechService {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;
  private transcript = '';
  private segments: TranscriptSegment[] = [];
  private startTime = 0;
  private lastSpeechTime = 0;
  private totalSpeakingTime = 0;
  private pauseStartTime = 0;
  private wordCount = 0;
  private fillerCount = 0;
  private callbacks: {
    onTranscript?: (text: string, segments: TranscriptSegment[]) => void;
    onAnalytics?: (analytics: SpeechAnalytics) => void;
    onError?: (error: string) => void;
    onStatusChange?: (status: 'listening' | 'stopped' | 'error') => void;
  } = {};

  private readonly FILLER_WORDS = [
    'um', 'uh', 'like', 'you know', 'so', 'actually', 'basically', 
    'literally', 'sort of', 'kind of', 'well', 'right', 'okay',
    'anyway', 'I mean', 'whatever', 'stuff like that'
  ];

  constructor() {
    this.initializeSpeechRecognition();
  }

  private initializeSpeechRecognition() {
    try {
      // Check for Speech Recognition support with proper typing
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

    // Configure recognition settings
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onstart = () => {
      this.isListening = true;
      this.startTime = Date.now();
      this.lastSpeechTime = Date.now();
      this.callbacks.onStatusChange?.('listening');
      console.log('Speech recognition started');
    };

    this.recognition.onresult = (event) => {
      this.processResults(event);
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      this.callbacks.onError?.(event.error);
      this.callbacks.onStatusChange?.('error');
      
      // Auto-restart on certain errors
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
      this.callbacks.onStatusChange?.('stopped');
      console.log('Speech recognition ended');
      
      // Auto-restart if we were supposed to be listening
      if (this.isListening) {
        setTimeout(() => this.restart(), 100);
      }
    };
  }

  private processResults(event: SpeechRecognitionEvent) {
    let finalTranscript = '';
    let interimTranscript = '';
    const currentTime = Date.now();

    // Update speaking time tracking
    if (currentTime - this.lastSpeechTime > 1000) {
      // Gap of more than 1 second indicates a pause
      this.pauseStartTime = this.lastSpeechTime;
    }
    this.lastSpeechTime = currentTime;

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence;

      if (result.isFinal) {
        finalTranscript += transcript;
        
        // Add to segments
        this.segments.push({
          text: transcript,
          timestamp: currentTime,
          confidence: confidence || 0.8,
          isFinal: true
        });
        
        this.analyzeText(transcript);
      } else {
        interimTranscript += transcript;
      }
    }

    if (finalTranscript) {
      this.transcript += finalTranscript;
      this.callbacks.onTranscript?.(this.transcript, this.segments);
    }
  }

  private analyzeText(text: string) {
    const words = text.toLowerCase().split(/\s+/).filter(word => word.length > 0);
    this.wordCount += words.length;

    // Count filler words with better detection
    const fillers = words.filter(word => {
      const cleanWord = word.replace(/[^\w\s]/g, '');
      return this.FILLER_WORDS.some(filler => 
        filler.includes(' ') ? text.toLowerCase().includes(filler) : cleanWord === filler
      );
    });
    this.fillerCount += fillers.length;

    // Calculate speaking time (excluding pauses > 2 seconds)
    const currentTime = Date.now();
    const totalTime = (currentTime - this.startTime) / 1000;
    
    // Estimate actual speaking time (rough calculation)
    this.totalSpeakingTime = totalTime * 0.7; // Assume 70% speaking, 30% pauses

    // Calculate metrics
    const wpm = this.totalSpeakingTime > 0 ? Math.round((this.wordCount / this.totalSpeakingTime) * 60) : 0;
    const fillerRate = this.wordCount > 0 ? (this.fillerCount / this.wordCount) * 100 : 0;
    
    // Enhanced confidence score calculation
    let confidenceScore = 100;
    
    // Penalize for slow/fast speech
    if (wpm < 100 || wpm > 180) confidenceScore -= 15;
    if (wpm < 80 || wpm > 200) confidenceScore -= 10;
    
    // Penalize for filler words
    if (fillerRate > 3) confidenceScore -= Math.min(25, fillerRate * 3);
    
    // Bonus for good pace
    if (wpm >= 120 && wpm <= 160 && fillerRate < 2) confidenceScore += 5;
    
    confidenceScore = Math.max(0, Math.min(100, confidenceScore));

    const analytics: SpeechAnalytics = {
      wordsPerMinute: wpm,
      fillerWords: this.fillerCount,
      pauseDuration: totalTime - this.totalSpeakingTime,
      confidenceScore: Math.round(confidenceScore),
      totalWords: this.wordCount,
      speakingTime: this.totalSpeakingTime
    };

    this.callbacks.onAnalytics?.(analytics);
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

  async startListening(callbacks: typeof this.callbacks = {}): Promise<boolean> {
    if (!this.recognition) {
      callbacks.onError?.('Speech recognition not supported in this browser');
      return false;
    }

    // Request microphone permission
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (error) {
      callbacks.onError?.('Microphone access denied');
      return false;
    }

    this.callbacks = callbacks;
    this.reset();
    
    try {
      this.recognition.start();
      return true;
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      callbacks.onError?.('Failed to start speech recognition');
      return false;
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.isListening = false;
      this.recognition.stop();
    }
  }

  private reset() {
    this.transcript = '';
    this.segments = [];
    this.wordCount = 0;
    this.fillerCount = 0;
    this.totalSpeakingTime = 0;
    this.pauseStartTime = 0;
  }

  isActive(): boolean {
    return this.isListening;
  }

  getTranscript(): string {
    return this.transcript;
  }

  getSegments(): TranscriptSegment[] {
    return this.segments;
  }

  getCurrentAnalytics(): SpeechAnalytics | null {
    if (this.wordCount === 0) return null;
    
    const currentTime = Date.now();
    const totalTime = (currentTime - this.startTime) / 1000;
    const speakingTime = totalTime * 0.7;
    const wpm = speakingTime > 0 ? Math.round((this.wordCount / speakingTime) * 60) : 0;
    const fillerRate = this.wordCount > 0 ? (this.fillerCount / this.wordCount) * 100 : 0;
    
    let confidenceScore = 100;
    if (wpm < 100 || wpm > 180) confidenceScore -= 15;
    if (fillerRate > 3) confidenceScore -= Math.min(25, fillerRate * 3);
    confidenceScore = Math.max(0, Math.min(100, confidenceScore));

    return {
      wordsPerMinute: wpm,
      fillerWords: this.fillerCount,
      pauseDuration: totalTime - speakingTime,
      confidenceScore: Math.round(confidenceScore),
      totalWords: this.wordCount,
      speakingTime
    };
  }

  // Static method to check browser support
  static isSupported(): boolean {
    return !!(
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition
    );
  }
}

export const speechService = new SpeechService();
