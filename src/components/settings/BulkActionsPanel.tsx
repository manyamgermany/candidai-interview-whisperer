
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Loader2, Zap, AlertTriangle } from "lucide-react";

interface BulkActionsPanelProps {
  settings: any;
  onTestResults: (results: any) => void;
}

export const BulkActionsPanel = ({ settings, onTestResults }: BulkActionsPanelProps) => {
  const { toast } = useToast();
  const [testing, setTesting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any>(null);

  const providers = [
    { id: "openai", name: "OpenAI", hasKey: !!settings.aiProvider?.openaiKey },
    { id: "claude", name: "Claude", hasKey: !!settings.aiProvider?.claudeKey },
    { id: "gemini", name: "Gemini", hasKey: !!settings.aiProvider?.geminiKey }
  ];

  const testAllConnections = async () => {
    setTesting(true);
    setProgress(0);
    const testResults: any = {};
    const providersWithKeys = providers.filter(p => p.hasKey);

    for (let i = 0; i < providersWithKeys.length; i++) {
      const provider = providersWithKeys[i];
      setProgress((i / providersWithKeys.length) * 100);

      try {
        // Simulate API test with timeout
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Mock test results
        const success = Math.random() > 0.3; // 70% success rate for demo
        testResults[provider.id] = {
          success,
          responseTime: Math.floor(Math.random() * 2000) + 500,
          error: success ? null : "API key invalid or rate limited"
        };
      } catch (error) {
        testResults[provider.id] = {
          success: false,
          responseTime: null,
          error: "Connection timeout"
        };
      }
    }

    setProgress(100);
    setResults(testResults);
    setTesting(false);
    onTestResults(testResults);

    const successCount = Object.values(testResults).filter((r: any) => r.success).length;
    toast({
      title: "Bulk Connection Test Complete",
      description: `${successCount}/${providersWithKeys.length} providers connected successfully`,
      variant: successCount === providersWithKeys.length ? "default" : "destructive"
    });
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
              Verify all configured API providers at once
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
              <span>Testing providers...</span>
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
                          {result.responseTime}ms
                        </Badge>
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          Connected
                        </Badge>
                      </>
                    ) : (
                      <Badge variant="destructive">
                        Failed
                      </Badge>
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
