
export interface SpeechAnalytics {
  wordsPerMinute: number;
  fillerWords: number;
  pauseDuration: number;
  confidenceScore: number;
  totalWords: number;
  speakingTime: number;
}

export interface TranscriptSegment {
  id: string;
  text: string;
  timestamp: number;
  confidence: number;
  isFinal: boolean;
}

export class SpeechAnalyticsCalculator {
  private readonly FILLER_WORDS = [
    'um', 'uh', 'like', 'you know', 'so', 'actually', 'basically', 
    'literally', 'sort of', 'kind of', 'well', 'right', 'okay',
    'anyway', 'I mean', 'whatever', 'stuff like that'
  ];

  private startTime = 0;
  private wordCount = 0;
  private fillerCount = 0;
  private totalSpeakingTime = 0;
  private segments: TranscriptSegment[] = [];

  reset() {
    this.startTime = Date.now();
    this.wordCount = 0;
    this.fillerCount = 0;
    this.totalSpeakingTime = 0;
    this.segments = [];
  }

  addSegment(segment: TranscriptSegment) {
    this.segments.push(segment);
    if (segment.isFinal) {
      this.analyzeText(segment.text);
    }
  }

  private analyzeText(text: string) {
    const words = text.toLowerCase().split(/\s+/).filter(word => word.length > 0);
    this.wordCount += words.length;

    // Count filler words
    const fillers = words.filter(word => {
      const cleanWord = word.replace(/[^\w\s]/g, '');
      return this.FILLER_WORDS.some(filler => 
        filler.includes(' ') ? text.toLowerCase().includes(filler) : cleanWord === filler
      );
    });
    this.fillerCount += fillers.length;

    // Calculate speaking time
    const currentTime = Date.now();
    const totalTime = (currentTime - this.startTime) / 1000;
    this.totalSpeakingTime = totalTime * 0.7; // Estimate 70% speaking
  }

  getCurrentAnalytics(): SpeechAnalytics {
    const currentTime = Date.now();
    const totalTime = (currentTime - this.startTime) / 1000;
    const speakingTime = this.totalSpeakingTime;
    const wpm = speakingTime > 0 ? Math.round((this.wordCount / speakingTime) * 60) : 0;
    const fillerRate = this.wordCount > 0 ? (this.fillerCount / this.wordCount) * 100 : 0;
    
    // Calculate confidence score
    let confidenceScore = 100;
    if (wpm < 100 || wpm > 180) confidenceScore -= 15;
    if (wpm < 80 || wpm > 200) confidenceScore -= 10;
    if (fillerRate > 3) confidenceScore -= Math.min(25, fillerRate * 3);
    if (wpm >= 120 && wpm <= 160 && fillerRate < 2) confidenceScore += 5;
    
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

  getSegments(): TranscriptSegment[] {
    return this.segments;
  }
}
