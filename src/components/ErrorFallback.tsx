
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
  showDetails?: boolean;
}

export const ErrorFallback = ({ error, resetError, showDetails = false }: ErrorFallbackProps) => {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-rose-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
          </div>
          <CardTitle className="text-xl">Something went wrong</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 text-center">
            We're sorry, but something unexpected happened. You can try refreshing the page or going back to the previous screen.
          </p>
          
          {showDetails && (
            <details className="bg-gray-50 p-3 rounded border">
              <summary className="cursor-pointer text-sm font-medium">Error Details</summary>
              <pre className="mt-2 text-xs text-gray-700 whitespace-pre-wrap">
                {error.message}
              </pre>
            </details>
          )}

          <div className="flex gap-2 justify-center">
            <Button 
              onClick={resetError}
              variant="outline"
              aria-label="Try again"
            >
              <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
              Try Again
            </Button>
            <Button 
              onClick={handleReload}
              aria-label="Reload page"
            >
              Reload Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
