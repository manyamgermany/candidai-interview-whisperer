
export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryCondition?: (error: any) => boolean;
}

export class RetryService {
  private static defaultOptions: Required<RetryOptions> = {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    backoffFactor: 2,
    retryCondition: (error: any) => {
      // Retry on network errors, timeouts, and rate limits
      if (error?.message?.includes('timeout')) return true;
      if (error?.message?.includes('network')) return true;
      if (error?.status === 429) return true; // Rate limit
      if (error?.status === 502) return true; // Bad gateway
      if (error?.status === 503) return true; // Service unavailable
      if (error?.status === 504) return true; // Gateway timeout
      return false;
    }
  };

  static async executeWithRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const config = { ...this.defaultOptions, ...options };
    let lastError: any;
    
    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        // Don't retry if it's the last attempt or if retry condition fails
        if (attempt === config.maxAttempts || !config.retryCondition(error)) {
          throw error;
        }
        
        // Calculate delay with exponential backoff
        const delay = Math.min(
          config.baseDelay * Math.pow(config.backoffFactor, attempt - 1),
          config.maxDelay
        );
        
        console.log(`Attempt ${attempt} failed, retrying in ${delay}ms:`, error.message);
        
        await this.delay(delay);
      }
    }
    
    throw lastError;
  }

  static async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Specialized retry for API calls
  static async retryApiCall<T>(
    apiCall: () => Promise<T>,
    provider: string
  ): Promise<T> {
    return this.executeWithRetry(apiCall, {
      maxAttempts: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      retryCondition: (error) => {
        // Provider-specific retry logic
        if (provider === 'openai') {
          return error?.status === 429 || error?.status >= 500;
        }
        if (provider === 'claude') {
          return error?.status === 529 || error?.status >= 500;
        }
        if (provider === 'gemini') {
          return error?.status === 429 || error?.status >= 500;
        }
        return this.defaultOptions.retryCondition(error);
      }
    });
  }

  // Bulk operation retry with individual tracking
  static async retryBulkOperations<T>(
    operations: Array<{ id: string; operation: () => Promise<T> }>,
    onProgress?: (completed: number, total: number, results: Record<string, { success: boolean; result?: T; error?: any }>) => void
  ): Promise<Record<string, { success: boolean; result?: T; error?: any }>> {
    const results: Record<string, { success: boolean; result?: T; error?: any }> = {};
    
    for (let i = 0; i < operations.length; i++) {
      const { id, operation } = operations[i];
      
      try {
        const result = await this.executeWithRetry(operation, {
          maxAttempts: 2, // Fewer retries for bulk operations
          baseDelay: 500
        });
        
        results[id] = { success: true, result };
      } catch (error) {
        results[id] = { success: false, error };
      }
      
      onProgress?.(i + 1, operations.length, results);
    }
    
    return results;
  }
}
