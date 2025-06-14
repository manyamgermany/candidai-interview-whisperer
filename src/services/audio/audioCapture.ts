
export class AudioCapture {
  private stream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;

  async requestTabAudio(): Promise<MediaStream | null> {
    try {
      // This requires the tabCapture permission
      if (typeof chrome !== 'undefined' && chrome.tabCapture) {
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

  async getMicrophoneStream(): Promise<MediaStream> {
    return await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      } 
    });
  }

  async startCapturing(): Promise<MediaStream | null> {
    try {
      // Try tab audio capture first
      const stream = await this.requestTabAudio();
      if (!stream) {
        // Fallback to microphone if tab audio fails
        this.stream = await this.getMicrophoneStream();
      } else {
        this.stream = stream;
      }
      return this.stream;
    } catch (error) {
      console.error('Failed to start audio capture:', error);
      throw error;
    }
  }

  stopCapturing() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }
  }

  getStream(): MediaStream | null {
    return this.stream;
  }
}
