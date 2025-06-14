
// Chrome extension API type definitions
declare namespace chrome {
  namespace tabCapture {
    interface CaptureOptions {
      audio?: boolean;
      video?: boolean;
    }
    
    function capture(
      options: CaptureOptions,
      callback: (stream: MediaStream | null) => void
    ): void;
  }
  
  namespace runtime {
    const lastError: chrome.runtime.LastError | undefined;
    
    interface LastError {
      message?: string;
    }
  }
}
