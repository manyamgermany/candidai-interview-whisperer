
import { aiService } from './aiService';
import { RetryService } from './retryService';

export interface ProviderConfig {
  id: string;
  name: string;
  apiKey: string;
  model: string;
  priority: number;
  isHealthy: boolean;
  lastHealthCheck: Date;
  responseTime: number;
  errorCount: number;
}

export class ProviderFallbackService {
  private providers: ProviderConfig[] = [];
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private readonly maxErrorCount = 3;
  private readonly healthCheckIntervalMs = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.startHealthChecking();
  }

  addProvider(config: Omit<ProviderConfig, 'isHealthy' | 'lastHealthCheck' | 'responseTime' | 'errorCount'>) {
    const provider: ProviderConfig = {
      ...config,
      isHealthy: true,
      lastHealthCheck: new Date(),
      responseTime: 0,
      errorCount: 0
    };
    
    this.providers.push(provider);
    this.sortProviders();
  }

  removeProvider(providerId: string) {
    this.providers = this.providers.filter(p => p.id !== providerId);
  }

  updateProvider(providerId: string, updates: Partial<ProviderConfig>) {
    const provider = this.providers.find(p => p.id === providerId);
    if (provider) {
      Object.assign(provider, updates);
      this.sortProviders();
    }
  }

  private sortProviders() {
    this.providers.sort((a, b) => {
      // Healthy providers first
      if (a.isHealthy !== b.isHealthy) {
        return a.isHealthy ? -1 : 1;
      }
      // Then by priority
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      // Then by response time
      return a.responseTime - b.responseTime;
    });
  }

  async makeRequest(prompt: string, options: any = {}): Promise<any> {
    const healthyProviders = this.providers.filter(p => p.isHealthy);
    
    if (healthyProviders.length === 0) {
      throw new Error('No healthy providers available');
    }

    let lastError: any;

    for (const provider of healthyProviders) {
      try {
        const startTime = Date.now();
        
        // Configure AI service for this provider
        await aiService.configure(provider.id, provider.apiKey, provider.model);
        
        // Make the request with retry logic
        const result = await RetryService.retryApiCall(
          () => aiService.generateResponse(prompt, options),
          provider.id
        );
        
        // Update provider health stats
        const responseTime = Date.now() - startTime;
        this.updateProviderStats(provider.id, true, responseTime);
        
        return {
          result,
          usedProvider: provider.id,
          responseTime
        };
        
      } catch (error) {
        lastError = error;
        console.warn(`Provider ${provider.id} failed:`, error.message);
        
        // Update provider error stats
        this.updateProviderStats(provider.id, false);
        
        // Continue to next provider
        continue;
      }
    }

    throw new Error(`All providers failed. Last error: ${lastError?.message}`);
  }

  private updateProviderStats(providerId: string, success: boolean, responseTime?: number) {
    const provider = this.providers.find(p => p.id === providerId);
    if (!provider) return;

    if (success) {
      provider.errorCount = Math.max(0, provider.errorCount - 1);
      if (responseTime) {
        provider.responseTime = Math.round((provider.responseTime + responseTime) / 2);
      }
    } else {
      provider.errorCount++;
      if (provider.errorCount >= this.maxErrorCount) {
        provider.isHealthy = false;
        console.warn(`Provider ${providerId} marked as unhealthy due to repeated failures`);
      }
    }

    this.sortProviders();
  }

  private async performHealthCheck(provider: ProviderConfig): Promise<boolean> {
    try {
      const startTime = Date.now();
      
      await aiService.configure(provider.id, provider.apiKey, provider.model);
      const isWorking = await aiService.testProvider(provider.id);
      
      if (isWorking) {
        const responseTime = Date.now() - startTime;
        provider.responseTime = responseTime;
        provider.errorCount = 0;
        provider.isHealthy = true;
      } else {
        provider.isHealthy = false;
      }
      
      provider.lastHealthCheck = new Date();
      return isWorking;
      
    } catch (error) {
      provider.isHealthy = false;
      provider.lastHealthCheck = new Date();
      return false;
    }
  }

  private startHealthChecking() {
    this.healthCheckInterval = setInterval(async () => {
      console.log('Performing provider health checks...');
      
      for (const provider of this.providers) {
        await this.performHealthCheck(provider);
      }
      
      this.sortProviders();
    }, this.healthCheckIntervalMs);
  }

  stopHealthChecking() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  getProviderStatus() {
    return this.providers.map(p => ({
      id: p.id,
      name: p.name,
      isHealthy: p.isHealthy,
      priority: p.priority,
      responseTime: p.responseTime,
      errorCount: p.errorCount,
      lastHealthCheck: p.lastHealthCheck
    }));
  }

  getPrimaryProvider(): ProviderConfig | null {
    return this.providers.find(p => p.isHealthy) || null;
  }

  // Test all providers and return results
  async testAllProviders(): Promise<Record<string, { success: boolean; responseTime?: number; error?: string }>> {
    const results: Record<string, { success: boolean; responseTime?: number; error?: string }> = {};
    
    for (const provider of this.providers) {
      try {
        const startTime = Date.now();
        const success = await this.performHealthCheck(provider);
        const responseTime = Date.now() - startTime;
        
        results[provider.id] = {
          success,
          responseTime: success ? responseTime : undefined,
          error: success ? undefined : 'Health check failed'
        };
      } catch (error) {
        results[provider.id] = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }
    
    return results;
  }
}

// Global instance
export const providerFallbackService = new ProviderFallbackService();
