
import { SpeechAnalyticsCalculator, SpeechAnalytics, TranscriptSegment } from './speech/speechAnalytics';

export interface AudioAnalysis {
  transcript: string;
  isQuestion: boolean;
  questionType: 'behavioral' | 'technical' | 'situational' | 'general';
  confidence: number;
  speakerChange: boolean;
  urgency: 'low' | 'medium' | 'high';
}

export interface UnifiedAudioConfig {
  onTranscript: (analysis: AudioAnalysis, segments: TranscriptSegment[]) => void;
  onAnalytics: (analytics: SpeechAnalytics) => void;
  onError: (error: string) => void;
  onStatusChange: (status: 'capturing' | 'stopped' | 'error' | 'processing') => void;
}

export class UnifiedAudioService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private recognition: SpeechRecognition | null = null;
  private analyticsCalculator: SpeechAnalyticsCalculator;
  private isCapturing = false;
  private callbacks: UnifiedAudioConfig = {
    onTranscript: () => {},
    onAnalytics: () => {},
    onError: () => {},
    onStatusChange: () => {}
  };
  
  // Enhanced question detection patterns
  private questionPatterns = [
    { pattern: /\b(tell me about a time|describe a situation|give me an example)\b/i, type: 'behavioral' as const, weight: 0.9 },
    { pattern: /\b(challenging|difficult|problem|issue|obstacle|conflict)\b/i, type: 'behavioral' as const, weight: 0.8 },
    { pattern: /\b(technical|code|algorithm|programming|technology|system|architecture)\b/i, type: 'technical' as const, weight: 0.85 },
    { pattern: /\b(what would you do|how would you handle|if you were|hypothetically)\b/i, type: 'situational' as const, weight: 0.8 },
    { pattern: /\b(what|how|why|when|where|who|can you|could you|would you)\b/i, type: 'general' as const, weight: 0.7 },
    { pattern: /\?$/, type: 'general' as const, weight: 0.9 },
    { pattern: /\b(experience with|worked on|familiar with|knowledge of)\b/i, type: 'technical' as const, weight: 0.75 }
  ];

  private lastTranscript = '';
  private restartAttempts = 0;
  private maxRestartAttempts = 5;
  private restartDelay = 1000;
  private confidenceThreshold = 0.7;

  constructor() {
    this.analyticsCalculator = new SpeechAnalyticsCalculator();
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
    this.recognition.maxAlternatives = 3;

    this.recognition.onstart = () => {
      this.isCapturing = true;
      this.restartAttempts = 0;
      this.callbacks.onStatusChange('capturing');
    };

    this.recognition.onresult = (event) => {
      this.processResults(event);
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      this.callbacks.onError(event.error);
      
      if (event.error === 'no-speech' || event.error === 'audio-capture') {
        this.handleRestart();
      } else {
        this.callbacks.onStatusChange('error');
      }
    };

    this.recognition.onend = () => {
      if (this.isCapturing) {
        this.handleRestart();
      } else {
        this.callbacks.onStatusChange('stopped');
      }
    };
  }

  private handleRestart() {
    if (this.restartAttempts < this.maxRestartAttempts && this.isCapturing) {
      this.restartAttempts++;
      const delay = this.restartDelay * Math.pow(2, this.restartAttempts - 1); // Exponential backoff
      
      setTimeout(() => {
        if (this.recognition && this.isCapturing) {
          try {
            this.recognition.start();
          } catch (error) {
            console.error('Failed to restart recognition:', error);
            this.callbacks.onError('Failed to restart speech recognition');
          }
        }
      }, delay);
    }
  }

  private processResults(event: SpeechRecognitionEvent) {
    let finalTranscript = '';
    const currentTime = Date.now();
    
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      const transcript = result[0].transcript.trim();
      const confidence = result[0].confidence || 0.8;

      if (result.isFinal && confidence >= this.confidenceThreshold) {
        finalTranscript += transcript + ' ';
        
        const segment: TranscriptSegment = {
          text: transcript,
          timestamp: currentTime,
          confidence,
          isFinal: true
        };
        
        this.analyticsCalculator.addSegment(segment);
      }
    }

    if (finalTranscript && finalTranscript !== this.lastTranscript) {
      this.lastTranscript = finalTranscript;
      this.callbacks.onStatusChange('processing');
      
      const analysis = this.analyzeTranscript(finalTranscript);
      const segments = this.analyticsCalculator.getSegments();
      const analytics = this.analyticsCalculator.getCurrentAnalytics();
      
      this.callbacks.onTranscript(analysis, segments);
      this.callbacks.onAnalytics(analytics);
      
      this.callbacks.onStatusChange('capturing');
    }
  }

  private analyzeTranscript(transcript: string): AudioAnalysis {
    const text = transcript.toLowerCase();
    let bestMatch = { type: 'general' as const, confidence: 0 };
    let isQuestion = false;

    // Enhanced question detection with confidence scoring
    for (const { pattern, type, weight } of this.questionPatterns) {
      if (pattern.test(text)) {
        isQuestion = true;
        const confidence = weight;
        if (confidence > bestMatch.confidence) {
          bestMatch = { type, confidence };
        }
      }
    }

    // Determine urgency based on question type and keywords
    let urgency: 'low' | 'medium' | 'high' = 'low';
    if (isQuestion) {
      if (bestMatch.type === 'behavioral' || bestMatch.type === 'technical') {
        urgency = 'high';
      } else if (bestMatch.type === 'situational') {
        urgency = 'medium';
      }
    }

    // Enhanced speaker change detection
    const speakerChange = this.detectSpeakerChange(transcript);

    return {
      transcript,
      isQuestion,
      questionType: bestMatch.type,
      confidence: bestMatch.confidence,
      speakerChange,
      urgency
    };
  }

  private detectSpeakerChange(transcript: string): boolean {
    // Enhanced speaker change detection
    const speakerIndicators = [
      /\b(okay|alright|so|um|well|now)\b/i,
      /\.\.\./,
      /\b(thank you|thanks)\b/i,
      /\b(next question|moving on)\b/i
    ];
    
    return speakerIndicators.some(pattern => pattern.test(transcript));
  }

  async startCapturing(config: UnifiedAudioConfig): Promise<boolean> {
    this.callbacks = config;

    try {
      // Try tab audio capture first
      const stream = await this.requestTabAudio();
      if (!stream) {
        // Fallback to microphone
        const micStream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 16000
          } 
        });
        this.stream = micStream;
      } else {
        this.stream = stream;
      }

      this.isCapturing = true;
      this.lastTranscript = '';
      this.analyticsCalculator.reset();

      // Start speech recognition
      if (this.recognition) {
        this.recognition.start();
      }

      return true;
    } catch (error) {
      console.error('Failed to start audio capture:', error);
      this.callbacks.onError('Failed to start audio capture');
      return false;
    }
  }

  private async requestTabAudio(): Promise<MediaStream | null> {
    try {
      if (typeof chrome !== 'undefined' && chrome.tabCapture) {
        return new Promise((resolve) => {
          chrome.tabCapture.capture({ audio: true }, (stream) => {
            if (chrome.runtime.lastError) {
              console.log('Tab capture failed, using microphone');
              resolve(null);
            } else {
              resolve(stream);
            }
          });
        });
      }
      return null;
    } catch (error) {
      console.log('Tab audio capture not available');
      return null;
    }
  }

  stopCapturing() {
    this.isCapturing = false;
    
    if (this.recognition) {
      this.recognition.stop();
    }
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    this.callbacks.onStatusChange('stopped');
  }

  isActive(): boolean {
    return this.isCapturing;
  }

  getTranscript(): string {
    return this.lastTranscript;
  }

  getSegments(): TranscriptSegment[] {
    return this.analyticsCalculator.getSegments();
  }

  getCurrentAnalytics(): SpeechAnalytics | null {
    return this.analyticsCalculator.getCurrentAnalytics();
  }

  static isSupported(): boolean {
    return !!(
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition
    );
  }
}

export const unifiedAudioService = new UnifiedAudioService();
