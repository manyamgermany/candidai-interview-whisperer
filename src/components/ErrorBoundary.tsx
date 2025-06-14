
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Bug, Home } from "lucide-react";
import { AppError, ErrorBoundaryState } from "@/types/errorTypes";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: AppError, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

export class ErrorBoundary extends Component<Props, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error: {
        code: error.name || 'UNKNOWN_ERROR',
        message: error.message,
        timestamp: Date.now(),
        details: error.stack
      }
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const appError: AppError = {
      code: error.name || 'UNKNOWN_ERROR',
      message: error.message,
      timestamp: Date.now(),
      details: { stack: error.stack, errorInfo }
    };

    console.error('Error Boundary caught an error:', appError);
    this.props.onError?.(appError, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-red-900">Something went wrong</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 text-center">
                We encountered an unexpected error. This has been logged and our team will investigate.
              </p>
              
              {this.props.showDetails && this.state.error && (
                <details className="text-xs text-gray-500 bg-gray-50 p-3 rounded border">
                  <summary className="cursor-pointer font-medium">Error Details</summary>
                  <div className="mt-2 space-y-1">
                    <div><strong>Code:</strong> {this.state.error.code}</div>
                    <div><strong>Time:</strong> {new Date(this.state.error.timestamp).toLocaleString()}</div>
                    <pre className="mt-2 whitespace-pre-wrap text-xs">{this.state.error.message}</pre>
                  </div>
                </details>
              )}
              
              <div className="flex space-x-2">
                <Button 
                  onClick={this.handleRetry}
                  className="flex-1"
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button 
                  onClick={this.handleGoHome}
                  className="flex-1"
                  variant="outline"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              </div>
              
              <Button 
                onClick={this.handleReload}
                className="w-full"
                variant="default"
              >
                <Bug className="h-4 w-4 mr-2" />
                Reload Application
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
