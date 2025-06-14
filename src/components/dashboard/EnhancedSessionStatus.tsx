
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Mic, 
  MicOff, 
  Brain, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Zap,
  TrendingUp
} from "lucide-react";
import { OptimizedSessionState } from "@/hooks/useOptimizedSessionManager";

interface EnhancedSessionStatusProps {
  sessionState: OptimizedSessionState;
  onStart: () => void;
  onStop: () => void;
  onClearError: () => void;
  averageConfidence: number;
  isSupported: boolean;
  canStart: boolean;
}

export const EnhancedSessionStatus = ({
  sessionState,
  onStart,
  onStop,
  onClearError,
  averageConfidence,
  isSupported,
  canStart
}: EnhancedSessionStatusProps) => {
  const getStatusIcon = () => {
    switch (sessionState.status) {
      case 'capturing':
        return <Mic className="h-5 w-5 text-green-500 animate-pulse" />;
      case 'processing':
        return <Brain className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <MicOff className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (sessionState.status) {
      case 'capturing':
        return 'bg-green-500';
      case 'processing':
        return 'bg-blue-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getConfidenceColor = () => {
    if (averageConfidence >= 0.8) return 'text-green-600';
    if (averageConfidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!isSupported) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm font-medium">
              Speech recognition not supported in this browser
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-pink-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className="text-lg">Audio Session</span>
            <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
          </div>
          <Badge variant={sessionState.isActive ? "default" : "secondary"}>
            {sessionState.status.charAt(0).toUpperCase() + sessionState.status.slice(1)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="text-2xl font-bold text-blue-600">
              {sessionState.segments.length}
            </div>
            <div className="text-xs text-gray-500">Segments</div>
          </div>
          <div className="space-y-1">
            <div className={`text-2xl font-bold ${getConfidenceColor()}`}>
              {Math.round(averageConfidence * 100)}%
            </div>
            <div className="text-xs text-gray-500">Confidence</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-purple-600">
              {sessionState.analytics?.wordsPerMinute || 0}
            </div>
            <div className="text-xs text-gray-500">WPM</div>
          </div>
        </div>

        {/* Audio Quality Indicator */}
        {sessionState.isActive && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Audio Quality</span>
              <span className={getConfidenceColor()}>
                {averageConfidence >= 0.8 ? 'Excellent' : 
                 averageConfidence >= 0.6 ? 'Good' : 'Poor'}
              </span>
            </div>
            <Progress 
              value={averageConfidence * 100} 
              className="h-2"
            />
          </div>
        )}

        {/* Real-time Indicators */}
        {sessionState.isActive && (
          <div className="flex items-center justify-center space-x-4 py-2">
            {sessionState.status === 'capturing' && (
              <div className="flex items-center space-x-2 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm">Listening</span>
              </div>
            )}
            {sessionState.status === 'processing' && (
              <div className="flex items-center space-x-2 text-blue-600">
                <Zap className="h-4 w-4 animate-bounce" />
                <span className="text-sm">Processing</span>
              </div>
            )}
            {sessionState.lastQuestion && (
              <div className="flex items-center space-x-2 text-purple-600">
                <Brain className="h-4 w-4" />
                <span className="text-sm">Question Detected</span>
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {sessionState.errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-red-700">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Error</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearError}
                className="text-red-600 hover:text-red-700"
              >
                Dismiss
              </Button>
            </div>
            <p className="text-sm text-red-600 mt-1">
              {sessionState.errorMessage}
            </p>
          </div>
        )}

        {/* Performance Insights */}
        {sessionState.analytics && sessionState.isActive && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2 text-blue-700 mb-2">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">Live Performance</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span>Filler words:</span>
                <span className="font-medium">{sessionState.analytics.fillerWords}</span>
              </div>
              <div className="flex justify-between">
                <span>Speaking time:</span>
                <span className="font-medium">{Math.round(sessionState.analytics.speakingTime)}s</span>
              </div>
            </div>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex space-x-2">
          {!sessionState.isActive ? (
            <Button
              onClick={onStart}
              disabled={!canStart}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Mic className="h-4 w-4 mr-2" />
              Start Session
            </Button>
          ) : (
            <Button
              onClick={onStop}
              variant="destructive"
              className="flex-1"
            >
              <MicOff className="h-4 w-4 mr-2" />
              Stop Session
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
