
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  Clock, 
  Copy, 
  X, 
  Lightbulb, 
  CheckCircle,
  AlertCircle,
  MessageSquare
} from "lucide-react";
import { AISuggestion } from "@/services/aiSuggestionService";
import { AudioAnalysis } from "@/services/unifiedAudioService";
import { useToast } from "@/hooks/use-toast";

interface AISuggestionPanelProps {
  suggestion: AISuggestion | null;
  lastQuestion: AudioAnalysis | null;
  onDismiss: () => void;
  isLoading?: boolean;
}

export const AISuggestionPanel = ({
  suggestion,
  lastQuestion,
  onDismiss,
  isLoading = false
}: AISuggestionPanelProps) => {
  const { toast } = useToast();

  const handleCopy = async () => {
    if (!suggestion) return;
    
    try {
      await navigator.clipboard.writeText(suggestion.suggestion);
      toast({
        title: "Copied!",
        description: "Suggestion copied to clipboard",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const getSuggestionIcon = () => {
    if (!suggestion) return <Brain className="h-5 w-5 text-gray-400" />;
    
    switch (suggestion.type) {
      case 'answer':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'clarification':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'follow-up':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Lightbulb className="h-5 w-5 text-purple-500" />;
    }
  };

  const getConfidenceColor = () => {
    if (!suggestion) return 'text-gray-400';
    if (suggestion.confidence >= 0.8) return 'text-green-600';
    if (suggestion.confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatTimestamp = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getSuggestionIcon()}
            <span className="text-lg">AI Assistant</span>
            {suggestion && (
              <Badge variant="outline" className="capitalize">
                {suggestion.type}
              </Badge>
            )}
          </div>
          {suggestion && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
            <Brain className="h-5 w-5 text-blue-500 animate-pulse" />
            <div className="flex-1">
              <div className="text-sm font-medium text-blue-700">
                Analyzing question...
              </div>
              <Progress value={60} className="h-2 mt-2" />
            </div>
          </div>
        )}

        {/* Last Question Info */}
        {lastQuestion && (
          <div className="p-3 bg-white/50 rounded-lg border border-purple-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-purple-700">
                Last Question Detected
              </span>
              <Badge variant="outline" size="sm" className="capitalize">
                {lastQuestion.questionType}
              </Badge>
            </div>
            <p className="text-sm text-gray-700 italic">
              "{lastQuestion.transcript}"
            </p>
            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
              <span>Confidence: {Math.round(lastQuestion.confidence * 100)}%</span>
              <span>Urgency: {lastQuestion.urgency}</span>
            </div>
          </div>
        )}

        {/* Suggestion Content */}
        {suggestion ? (
          <div className="space-y-3">
            {/* Confidence Indicator */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">AI Confidence</span>
              <div className="flex items-center space-x-2">
                <Progress 
                  value={suggestion.confidence * 100} 
                  className="w-16 h-2"
                />
                <span className={`text-sm font-medium ${getConfidenceColor()}`}>
                  {Math.round(suggestion.confidence * 100)}%
                </span>
              </div>
            </div>

            {/* Suggestion Text */}
            <div className="p-4 bg-white rounded-lg border border-purple-200 shadow-sm">
              <p className="text-gray-800 leading-relaxed">
                {suggestion.suggestion}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                <span>{formatTimestamp(suggestion.timestamp)}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="text-purple-600 border-purple-200 hover:bg-purple-50"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>

            {/* Context Preview */}
            {suggestion.context && (
              <details className="text-xs">
                <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                  View context used
                </summary>
                <div className="mt-2 p-2 bg-gray-50 rounded text-gray-600">
                  {suggestion.context}
                </div>
              </details>
            )}
          </div>
        ) : !isLoading && !lastQuestion && (
          <div className="text-center py-6 text-gray-500">
            <Brain className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm font-medium">Waiting for questions...</p>
            <p className="text-xs mt-1">
              Start your session and I'll help you respond to interview questions
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
