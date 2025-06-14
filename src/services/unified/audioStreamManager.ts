
export class AudioStreamManager {
  private stream: MediaStream | null = null;

  async startCapturing(): Promise<MediaStream | null> {
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

      return this.stream;
    } catch (error) {
      console.error('Failed to start audio capture:', error);
      throw error;
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
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

  getStream(): MediaStream | null {
    return this.stream;
  }
}
