import { RetryService } from "@/services/retryService";

interface Provider {
  id: string;
  name: string;
  apiKey: string;
  model: string;
  priority: number;
  healthy?: boolean;
}

class ProviderFallbackService {
  private providers: Provider[] = [];
  private healthStatus: { [providerId: string]: { healthy: boolean; lastChecked: number } } = {};

  addProvider(provider: Provider) {
    this.providers.push(provider);
    this.providers.sort((a, b) => a.priority - b.priority);
    this.healthStatus[provider.id] = { healthy: true, lastChecked: Date.now() };
  }

  getProviders(): Provider[] {
    return this.providers;
  }

  getHealthyProviders(): Provider[] {
    return this.providers.filter(provider => this.isProviderHealthy(provider.id));
  }

  isProviderHealthy(providerId: string): boolean {
    return this.healthStatus[providerId]?.healthy === true;
  }

  updateProviderHealth(providerId: string, healthy: boolean) {
    this.healthStatus[providerId] = { healthy, lastChecked: Date.now() };
  }

  async testAllProviders(): Promise<any> {
    const testResults: any = {};
    for (const provider of this.providers) {
      try {
        const result = await RetryService.retryApiCall(
          async () => {
            const startTime = Date.now();
            // Simulate API test
            await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
            const responseTime = Date.now() - startTime;
            return { success: true, responseTime };
          },
          provider.id
        );
        testResults[provider.id] = { success: true, responseTime: result.responseTime };
      } catch (error: any) {
        testResults[provider.id] = { success: false, error: error.message };
      }
    }
    return testResults;
  }

  async executeWithFallback(operation: string, params: any = {}): Promise<any> {
    const availableProviders = this.getHealthyProviders();
    
    if (availableProviders.length === 0) {
      throw new Error('No healthy providers available');
    }

    for (const provider of availableProviders) {
      try {
        // Use a more generic approach instead of calling generateResponse directly
        const result = await this.executeProviderOperation(provider, operation, params);
        
        // Update provider health on success
        this.updateProviderHealth(provider.id, true);
        
        return result;
        
      } catch (error) {
        console.warn(`Provider ${provider.name} failed:`, error);
        
        // Update provider health on failure
        this.updateProviderHealth(provider.id, false);
        
        // Continue to next provider
        continue;
      }
    }
    
    throw new Error('All providers failed');
  }

  private async executeProviderOperation(provider: Provider, operation: string, params: any): Promise<any> {
    // Mock implementation - in real app this would route to actual provider APIs
    switch (operation) {
      case 'generateResponse':
        return { response: `Mock response from ${provider.name}`, provider: provider.id };
      case 'testConnection':
        // Simulate API test
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
        return { success: true, responseTime: Math.floor(Math.random() * 1000) + 200 };
      default:
        throw new Error(`Unsupported operation: ${operation}`);
    }
  }

  // Example method to simulate generating a response
  async generateResponse(prompt: string): Promise<any> {
    return this.executeWithFallback('generateResponse', { prompt });
  }
}

export const providerFallbackService = new ProviderFallbackService();
