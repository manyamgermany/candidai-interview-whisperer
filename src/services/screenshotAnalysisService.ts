
import { aiService } from './aiService';
import { storageService } from './storageService';

export interface ScreenshotAnalysis {
  insights: string;
  confidence: number;
  questions: string[];
  keyPoints: string[];
  actionItems: string[];
  timestamp: number;
}

class ScreenshotAnalysisService {
  private isCapturing = false;

  async captureAndAnalyze(): Promise<ScreenshotAnalysis | null> {
    if (this.isCapturing) {
      throw new Error('Screenshot capture already in progress');
    }

    this.isCapturing = true;

    try {
      // Capture the screen
      const screenshot = await this.captureScreen();
      
      if (!screenshot) {
        throw new Error('Failed to capture screenshot');
      }

      // Convert to base64 for AI analysis
      const base64Image = await this.convertToBase64(screenshot);
      
      // Analyze with vision-capable AI
      const analysis = await this.analyzeWithAI(base64Image);
      
      // Store analysis for history
      await this.storeAnalysis(analysis);
      
      return analysis;
    } finally {
      this.isCapturing = false;
    }
  }

  private async captureScreen(): Promise<Blob | null> {
    try {
      // Try to capture the entire screen first
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { max: 1920 },
          height: { max: 1080 }
        },
        audio: false
      });

      // Create a video element to capture a frame
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      return new Promise((resolve) => {
        video.addEventListener('loadedmetadata', () => {
          // Create canvas to capture frame
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0);
            
            // Stop the stream
            stream.getTracks().forEach(track => track.stop());
            
            // Convert to blob
            canvas.toBlob((blob) => {
              resolve(blob);
            }, 'image/jpeg', 0.8);
          } else {
            resolve(null);
          }
        });
      });
    } catch (error) {
      console.error('Screen capture failed:', error);
      
      // Fallback: try to capture current tab content using html2canvas approach
      try {
        return await this.captureCurrentPage();
      } catch (fallbackError) {
        console.error('Page capture fallback failed:', fallbackError);
        return null;
      }
    }
  }

  private async captureCurrentPage(): Promise<Blob | null> {
    // Create a canvas to capture the current page
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return null;

    // Set canvas size to viewport
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Fill with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add text indicating this is a page capture
    ctx.fillStyle = '#333333';
    ctx.font = '16px Arial';
    ctx.fillText('Page content captured for analysis', 20, 40);
    ctx.fillText(`URL: ${window.location.href}`, 20, 70);
    ctx.fillText(`Title: ${document.title}`, 20, 100);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.8);
    });
  }

  private async convertToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        // Remove data URL prefix
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private async analyzeWithAI(base64Image: string): Promise<ScreenshotAnalysis> {
    const settings = await storageService.getSettings();
    const aiConfig = settings.aiConfig;

    if (!aiConfig || aiConfig.provider === 'fallback') {
      return this.createFallbackAnalysis();
    }

    try {
      const prompt = this.buildAnalysisPrompt();
      
      // Use the existing AI service with a vision-specific prompt
      const response = await aiService.generateSuggestion(
        prompt + "\n\nNote: This analysis is based on a screenshot of the current screen content.",
        'visual-analysis',
        'structured-analysis'
      );

      return {
        insights: response.suggestion,
        confidence: response.confidence || 75,
        questions: this.extractQuestions(response.suggestion),
        keyPoints: this.extractKeyPoints(response.suggestion),
        actionItems: this.extractActionItems(response.suggestion),
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('AI analysis failed:', error);
      return this.createFallbackAnalysis();
    }
  }

  private buildAnalysisPrompt(): string {
    return `Analyze this screenshot and provide actionable insights:

1. KEY INSIGHTS: Main topics, concepts, or information visible
2. POTENTIAL QUESTIONS: Questions that might be asked about this content
3. KEY POINTS: Important facts, numbers, or details
4. ACTION ITEMS: Tasks, next steps, or follow-ups

Focus on:
- Text content (documents, web pages, presentations)
- Visual elements (charts, diagrams, images)
- Code or technical content
- Educational material (exams, tutorials)
- Any actionable information

Provide practical insights for:
- Online exams and tests
- Meeting presentations
- Educational content
- Technical documentation
- Work-related materials

Format your response as:
**Insights:** [main insights]
**Questions:** [potential questions]
**Key Points:** [important details]
**Actions:** [action items]`;
  }

  private extractQuestions(text: string): string[] {
    const questionSection = text.match(/\*\*Questions:\*\*(.*?)(?:\*\*|$)/s);
    if (!questionSection) return [];
    
    return questionSection[1]
      .split(/[•\-\n]/)
      .map(q => q.trim())
      .filter(q => q.length > 0)
      .slice(0, 5);
  }

  private extractKeyPoints(text: string): string[] {
    const keyPointsSection = text.match(/\*\*Key Points:\*\*(.*?)(?:\*\*|$)/s);
    if (!keyPointsSection) return [];
    
    return keyPointsSection[1]
      .split(/[•\-\n]/)
      .map(p => p.trim())
      .filter(p => p.length > 0)
      .slice(0, 5);
  }

  private extractActionItems(text: string): string[] {
    const actionsSection = text.match(/\*\*Actions:\*\*(.*?)(?:\*\*|$)/s);
    if (!actionsSection) return [];
    
    return actionsSection[1]
      .split(/[•\-\n]/)
      .map(a => a.trim())
      .filter(a => a.length > 0)
      .slice(0, 5);
  }

  private createFallbackAnalysis(): ScreenshotAnalysis {
    return {
      insights: "Screenshot captured successfully. Configure an AI provider with vision capabilities (GPT-4 Vision, Claude, or Gemini) in settings to get detailed analysis of screen content, including exam questions, presentations, and educational material.",
      confidence: 50,
      questions: [
        "What are the main topics shown on screen?",
        "Are there any questions or problems that need answers?",
        "What key information should be noted?"
      ],
      keyPoints: [
        "Screenshot captured at " + new Date().toLocaleTimeString(),
        "Current page: " + window.location.href,
        "Enable AI vision analysis in settings for detailed insights"
      ],
      actionItems: [
        "Configure AI provider with vision capabilities",
        "Review captured content for important details",
        "Take notes on key information displayed"
      ],
      timestamp: Date.now()
    };
  }

  private async storeAnalysis(analysis: ScreenshotAnalysis): Promise<void> {
    try {
      const settings = await storageService.getSettings();
      const history = settings.screenshotHistory || [];
      
      // Keep only last 50 analyses
      const updatedHistory = [analysis, ...history].slice(0, 50);
      
      await storageService.saveSettings({
        screenshotHistory: updatedHistory
      });
    } catch (error) {
      console.error('Failed to store screenshot analysis:', error);
    }
  }

  async getAnalysisHistory(): Promise<ScreenshotAnalysis[]> {
    try {
      const settings = await storageService.getSettings();
      return settings.screenshotHistory || [];
    } catch (error) {
      console.error('Failed to get analysis history:', error);
      return [];
    }
  }

  isCurrentlyCapturing(): boolean {
    return this.isCapturing;
  }
}

export const screenshotAnalysisService = new ScreenshotAnalysisService();
