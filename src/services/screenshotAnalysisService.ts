
export interface ScreenshotAnalysis {
  insights: string;
  confidence: number;
  suggestions: string[];
  detectedContent: string[];
}

export class ScreenshotAnalysisService {
  async captureAndAnalyze(): Promise<ScreenshotAnalysis | null> {
    try {
      // Request screen capture permission
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      });

      // Create video element to capture frame
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      return new Promise((resolve) => {
        video.onloadedmetadata = () => {
          // Create canvas to capture screenshot
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(null);
            return;
          }

          ctx.drawImage(video, 0, 0);
          
          // Stop the stream
          stream.getTracks().forEach(track => track.stop());
          
          // Convert to base64
          const imageData = canvas.toDataURL('image/png');
          
          // Analyze the screenshot
          this.analyzeImage(imageData).then(resolve);
        };
      });
    } catch (error) {
      console.error('Screenshot capture failed:', error);
      throw error;
    }
  }

  private async analyzeImage(imageData: string): Promise<ScreenshotAnalysis> {
    // This would typically call an AI vision service
    // For now, we'll return a mock analysis
    
    const mockAnalysis: ScreenshotAnalysis = {
      insights: "Screen content analyzed successfully. Consider preparing responses about leadership experience, technical challenges, and career goals based on the visible content.",
      confidence: 85,
      suggestions: [
        "Prepare examples of teamwork and collaboration",
        "Think about specific metrics and achievements",
        "Consider questions about problem-solving approaches"
      ],
      detectedContent: [
        "Professional interface",
        "Meeting platform detected",
        "Presentation slides visible"
      ]
    };

    // Add some delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    return mockAnalysis;
  }

  async analyzeImageWithAI(imageData: string): Promise<ScreenshotAnalysis> {
    // This would integrate with AI vision APIs like OpenAI Vision, Google Vision, etc.
    // For now, return enhanced mock analysis
    
    return {
      insights: "AI Vision detected interview-related content. Prepare for behavioral questions about leadership, technical discussions about your experience, and questions about handling challenges.",
      confidence: 92,
      suggestions: [
        "Use the STAR method for behavioral questions",
        "Prepare specific examples with metrics",
        "Practice explaining complex technical concepts simply"
      ],
      detectedContent: [
        "Video meeting interface",
        "Professional background",
        "Screen sharing detected",
        "Interview-style setup identified"
      ]
    };
  }
}

export const screenshotAnalysisService = new ScreenshotAnalysisService();
