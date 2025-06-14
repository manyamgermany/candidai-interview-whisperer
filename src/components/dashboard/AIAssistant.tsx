
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain } from "lucide-react";
import { AIResponse } from "@/services/aiService";
import { SpeechAnalytics } from "@/services/speechService";

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: number;
}

interface AIAssistantProps {
  sessionActive: boolean;
  aiSuggestion: AIResponse | null;
  analytics: SpeechAnalytics;
  chatMessages?: ChatMessage[];
  isLoading?: boolean;
}

export const AIAssistant = ({ sessionActive, aiSuggestion, analytics, chatMessages = [], isLoading = false }: AIAssistantProps) => {
  return (
    <Card className="border-pink-100">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-pink-600" />
          <span>AI Assistant</span>
        </CardTitle>
        <CardDescription>
          Real-time suggestions and coaching during your meeting
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Chat Messages Display */}
        {chatMessages.length > 0 && (
          <div className="max-h-64 overflow-y-auto space-y-3 mb-4 bg-gray-50 p-3 rounded-lg">
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-2 rounded-lg text-sm ${
                    message.type === 'user'
                      ? 'bg-pink-500 text-white'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 p-2 rounded-lg text-sm text-gray-500">
                  AI is thinking...
                </div>
              </div>
            )}
          </div>
        )}

        {/* Session-based AI suggestions */}
        {sessionActive && aiSuggestion ? (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-blue-900">{aiSuggestion.suggestion}</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Confidence: {aiSuggestion.confidence}% • Framework: {aiSuggestion.framework || 'General'}
                  </p>
                </div>
              </div>
            </div>
            {analytics.wordsPerMinute > 0 && analytics.wordsPerMinute >= 120 && analytics.wordsPerMinute <= 150 && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-green-900">Great pace! Maintain current speaking speed</p>
                    <p className="text-xs text-green-700 mt-1">
                      Your current {analytics.wordsPerMinute} WPM is in the optimal range for clear communication.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : chatMessages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>AI assistance will appear here during your meeting session</p>
            <p className="text-sm mt-2">Start a session to receive real-time coaching and suggestions</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};
