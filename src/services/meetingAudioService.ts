import { AudioAnalysis, MeetingAudioConfig } from './audio/audioTypes';
import { QuestionClassifier } from './audio/questionClassifier';
import { SpeechRecognitionService } from './audio/speechRecognitionService';
import { AudioCapture } from './audio/audioCapture';

export type { AudioAnalysis, MeetingAudioConfig };

export { AudioAnalysis, MeetingAudioConfig };

export class MeetingAudioService {
  private speechRecognition: SpeechRecognitionService;
  private audioCapture: AudioCapture;
  private questionClassifier: QuestionClassifier;
  private isCapturing = false;
  private callbacks: MeetingAudioConfig = {
    onTranscript: () => {},
    onError: () => {},
    onStatusChange: () => {}
  };

  constructor() {
    this.speechRecognition = new SpeechRecognitionService();
    this.audioCapture = new AudioCapture();
    this.questionClassifier = new QuestionClassifier();
  }

  private analyzeTranscript(transcript: string) {
    const isQuestion = this.questionClassifier.detectQuestion(transcript);
    const questionType = this.questionClassifier.classifyQuestionType(transcript);
    const speakerChange = this.questionClassifier.detectSpeakerChange(transcript);
    
    const analysis: AudioAnalysis = {
      transcript,
      isQuestion,
      questionType,
      confidence: isQuestion ? 0.85 : 0.6,
      speakerChange
    };

    this.callbacks.onTranscript(analysis);
  }

  async startCapturing(config: MeetingAudioConfig): Promise<boolean> {
    this.callbacks = config;

    try {
      // Start audio capture
      await this.audioCapture.startCapturing();

      this.isCapturing = true;
      this.callbacks.onStatusChange('capturing');

      // Start speech recognition
      const success = this.speechRecognition.start({
        onResult: (transcript) => {
          this.analyzeTranscript(transcript);
        },
        onError: (error) => {
          this.callbacks.onError(error);
        },
        onEnd: () => {
          if (!this.isCapturing) {
            this.callbacks.onStatusChange('stopped');
          }
        }
      });

      if (!success) {
        this.callbacks.onError('Failed to start speech recognition');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to start audio capture:', error);
      this.callbacks.onError('Failed to start audio capture');
      return false;
    }
  }

  stopCapturing() {
    this.isCapturing = false;
    this.speechRecognition.stop();
    this.audioCapture.stopCapturing();
    this.callbacks.onStatusChange('stopped');
  }

  isActive(): boolean {
    return this.isCapturing;
  }

  static isSupported(): boolean {
    return SpeechRecognitionService.isSupported();
  }
}

export const meetingAudioService = new MeetingAudioService();
