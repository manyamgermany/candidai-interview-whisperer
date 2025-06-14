
import { SpeechAnalyticsCalculator, SpeechAnalytics, TranscriptSegment } from './speech/speechAnalytics';
import { AudioAnalysis, UnifiedAudioConfig } from './unified/audioTypes';
import { QuestionDetector } from './unified/questionDetector';
import { SpeechRecognitionManager } from './unified/speechRecognitionManager';
import { AudioStreamManager } from './unified/audioStreamManager';

export type { AudioAnalysis, UnifiedAudioConfig };

export class UnifiedAudioService {
  private speechRecognitionManager: SpeechRecognitionManager;
  private audioStreamManager: AudioStreamManager;
  private questionDetector: QuestionDetector;
  private analyticsCalculator: SpeechAnalyticsCalculator;
  private isCapturing = false;
  private callbacks: UnifiedAudioConfig = {
    onTranscript: () => {},
    onAnalytics: () => {},
    onError: () => {},
    onStatusChange: () => {}
  };
  
  private lastTranscript = '';

  constructor() {
    this.speechRecognitionManager = new SpeechRecognitionManager();
    this.audioStreamManager = new AudioStreamManager();
    this.questionDetector = new QuestionDetector();
    this.analyticsCalculator = new SpeechAnalyticsCalculator();
  }

  private processResults(event: SpeechRecognitionEvent) {
    let finalTranscript = '';
    const currentTime = Date.now();
    const confidenceThreshold = this.speechRecognitionManager.getConfidenceThreshold();
    
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      const transcript = result[0].transcript.trim();
      const confidence = result[0].confidence || 0.8;

      if (result.isFinal && confidence >= confidenceThreshold) {
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
    const questionResult = this.questionDetector.detectQuestion(transcript);
    const speakerChange = this.questionDetector.detectSpeakerChange(transcript);
    const urgency = this.questionDetector.determineUrgency(questionResult.type, questionResult.isQuestion);

    return {
      transcript,
      isQuestion: questionResult.isQuestion,
      questionType: questionResult.type,
      confidence: questionResult.confidence,
      speakerChange,
      urgency
    };
  }

  async startCapturing(config: UnifiedAudioConfig): Promise<boolean> {
    this.callbacks = config;

    try {
      // Start audio stream
      await this.audioStreamManager.startCapturing();

      this.isCapturing = true;
      this.lastTranscript = '';
      this.analyticsCalculator.reset();

      // Start speech recognition
      const success = this.speechRecognitionManager.start({
        onResult: (event) => this.processResults(event),
        onError: (error) => this.callbacks.onError(error),
        onStatusChange: (status) => this.callbacks.onStatusChange(status as any)
      });

      return success;
    } catch (error) {
      console.error('Failed to start audio capture:', error);
      this.callbacks.onError('Failed to start audio capture');
      return false;
    }
  }

  stopCapturing() {
    this.isCapturing = false;
    this.speechRecognitionManager.stop();
    this.audioStreamManager.stopCapturing();
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
    return SpeechRecognitionManager.isSupported();
  }
}

export const unifiedAudioService = new UnifiedAudioService();
