
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Loader2, Zap, AlertTriangle } from "lucide-react";
import { RetryService } from "@/services/retryService";
import { providerFallbackService } from "@/services/providerFallbackService";

interface BulkActionsPanelProps {
  settings: any;
  onTestResults: (results: any) => void;
}

export const BulkActionsPanel = ({ settings, onTestResults }: BulkActionsPanelProps) => {
  const { toast } = useToast();
  const [testing, setTesting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any>(null);
  const [currentOperation, setCurrentOperation] = useState<string>("");

  const providers = [
    { id: "openai", name: "OpenAI", hasKey: !!settings.aiProvider?.openaiKey },
    { id: "claude", name: "Claude", hasKey: !!settings.aiProvider?.claudeKey },
    { id: "gemini", name: "Gemini", hasKey: !!settings.aiProvider?.geminiKey }
  ];

  const testAllConnections = async () => {
    setTesting(true);
    setProgress(0);
    setResults(null);
    
    const providersWithKeys = providers.filter(p => p.hasKey);
    
    if (providersWithKeys.length === 0) {
      toast({
        title: "No API Keys",
        description: "Please configure at least one API key before testing.",
        variant: "destructive"
      });
      setTesting(false);
      return;
    }

    try {
      // Use the new retry service for bulk operations
      const operations = providersWithKeys.map(provider => ({
        id: provider.id,
        operation: async () => {
          setCurrentOperation(`Testing ${provider.name}...`);
          
          // Simulate the actual test with the provider's API
          const startTime = Date.now();
          const success = await providerFallbackService.testAllProviders();
          const responseTime = Date.now() - startTime;
          
          return {
            success: success[provider.id]?.success || false,
            responseTime: success[provider.id]?.responseTime || responseTime,
            error: success[provider.id]?.error || null
          };
        }
      }));

      const testResults = await RetryService.retryBulkOperations(
        operations,
        (completed, total, currentResults) => {
          setProgress((completed / total) * 100);
          setResults(currentResults);
        }
      );

      setResults(testResults);
      onTestResults(testResults);

      const successCount = Object.values(testResults).filter((r: any) => r.success).length;
      toast({
        title: "Bulk Connection Test Complete",
        description: `${successCount}/${providersWithKeys.length} providers connected successfully`,
        variant: successCount === providersWithKeys.length ? "default" : "destructive"
      });
      
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Failed to complete connection tests. Please try again.",
        variant: "destructive"
      });
    } finally {
      setTesting(false);
      setCurrentOperation("");
      setProgress(100);
    }
  };

  return (
    <Card className="border-blue-100">
      <CardHeader>
        <CardTitle className="text-lg flex items-center space-x-2">
          <Zap className="h-5 w-5 text-blue-600" />
          <span>Bulk Actions</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Test All Connections</h4>
            <p className="text-sm text-gray-500">
              Verify all configured API providers with automatic retry on failure
            </p>
          </div>
          <Button 
            onClick={testAllConnections}
            disabled={testing || providers.filter(p => p.hasKey).length === 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {testing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Test All
              </>
            )}
          </Button>
        </div>

        {testing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{currentOperation || "Preparing tests..."}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {results && (
          <div className="space-y-3 pt-2 border-t">
            <h4 className="font-medium">Test Results</h4>
            {providers.filter(p => p.hasKey).map((provider) => {
              const result = results[provider.id];
              if (!result) return null;

              return (
                <div key={provider.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {result.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="font-medium">{provider.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {result.success ? (
                      <>
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          {result.result?.responseTime || 'N/A'}ms
                        </Badge>
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          Connected
                        </Badge>
                      </>
                    ) : (
                      <>
                        <Badge variant="destructive">
                          Failed
                        </Badge>
                        {result.error && (
                          <span className="text-xs text-red-600 max-w-32 truncate" title={result.error}>
                            {result.error}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {providers.filter(p => p.hasKey).length === 0 && (
          <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">No API keys configured to test</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
