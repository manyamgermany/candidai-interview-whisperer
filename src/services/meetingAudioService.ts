
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

export class MeetingAudioService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private isCapturing = false;
  private callbacks: MeetingAudioConfig = {
    onTranscript: () => {},
    onError: () => {},
    onStatusChange: () => {}
  };
  private recognition: SpeechRecognition | null = null;
  private lastTranscript = '';
  private questionPatterns = [
    /\b(what|how|why|when|where|who|can you|could you|would you|tell me|describe|explain)\b/i,
    /\?$/,
    /\b(experience with|worked on|familiar with|knowledge of)\b/i,
    /\b(challenging|difficult|problem|issue|obstacle)\b/i
  ];

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
        this.analyzeTranscript(finalTranscript);
      }
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      this.callbacks.onError(event.error);
    };

    this.recognition.onend = () => {
      if (this.isCapturing) {
        // Auto-restart if we should still be capturing
        setTimeout(() => {
          if (this.recognition && this.isCapturing) {
            this.recognition.start();
          }
        }, 100);
      }
    };
  }

  private analyzeTranscript(transcript: string) {
    const isQuestion = this.detectQuestion(transcript);
    const questionType = this.classifyQuestionType(transcript);
    
    // Detect speaker change by analyzing speech patterns
    const speakerChange = this.detectSpeakerChange(transcript);
    
    const analysis: AudioAnalysis = {
      transcript,
      isQuestion,
      questionType,
      confidence: isQuestion ? 0.85 : 0.6,
      speakerChange
    };

    this.callbacks.onTranscript(analysis);
  }

  private detectQuestion(transcript: string): boolean {
    return this.questionPatterns.some(pattern => pattern.test(transcript));
  }

  private classifyQuestionType(transcript: string): 'behavioral' | 'technical' | 'situational' | 'general' {
    const text = transcript.toLowerCase();
    
    if (text.includes('tell me about a time') || text.includes('describe a situation') || 
        text.includes('give me an example') || text.includes('challenging') || 
        text.includes('difficult')) {
      return 'behavioral';
    }
    
    if (text.includes('technical') || text.includes('code') || text.includes('algorithm') ||
        text.includes('programming') || text.includes('technology') || text.includes('system')) {
      return 'technical';
    }
    
    if (text.includes('what would you do') || text.includes('how would you handle') ||
        text.includes('if you were') || text.includes('hypothetically')) {
      return 'situational';
    }
    
    return 'general';
  }

  private detectSpeakerChange(transcript: string): boolean {
    // Simple heuristic: if there's a significant pause or change in speaking pattern
    // This is a simplified implementation - could be enhanced with voice analysis
    return transcript.includes('...') || transcript.includes('um,') || transcript.includes('so,');
  }

  async startCapturing(config: MeetingAudioConfig): Promise<boolean> {
    this.callbacks = config;

    try {
      // Request tab audio capture
      const stream = await this.requestTabAudio();
      if (!stream) {
        // Fallback to microphone if tab audio fails
        const micStream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        });
        this.stream = micStream;
      } else {
        this.stream = stream;
      }

      this.isCapturing = true;
      this.callbacks.onStatusChange('capturing');

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
      // This requires the tabCapture permission
      if (chrome && chrome.tabCapture) {
        return new Promise((resolve) => {
          chrome.tabCapture.capture({ audio: true }, (stream) => {
            if (chrome.runtime.lastError) {
              console.log('Tab capture failed, will use microphone');
              resolve(null);
            } else {
              resolve(stream);
            }
          });
        });
      }
      return null;
    } catch (error) {
      console.log('Tab audio capture not available, using microphone');
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
    
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }
    
    this.callbacks.onStatusChange('stopped');
  }

  isActive(): boolean {
    return this.isCapturing;
  }
}

export const meetingAudioService = new MeetingAudioService();
