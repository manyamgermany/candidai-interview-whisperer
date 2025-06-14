import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain } from "lucide-react";
import { AIResponse } from "@/types";
import { SpeechAnalytics } from "@/services/speechService";
import { ChatMessage } from "@/types/chatTypes";

interface AIAssistantProps {
  sessionActive: boolean;
  aiSuggestion: AIResponse | null;
  analytics: SpeechAnalytics;
  chatMessages?: ChatMessage[];
  isLoading?: boolean;
}

export const AIAssistant = ({ sessionActive, aiSuggestion, analytics, chatMessages = [], isLoading = false }: AIAssistantProps) => {
  return (
    <Card className="border-pink-100 h-full flex flex-col">
      <CardHeader className="flex-shrink-0 pb-4">
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-pink-600" />
          <span>AI Assistant</span>
        </CardTitle>
        <CardDescription>
          Real-time suggestions and coaching during your meeting
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0 pt-0">
        {/* Chat Messages Display - Takes most of the space */}
        {chatMessages.length > 0 ? (
          <ScrollArea className="flex-1 w-full">
            <div className="space-y-4 pr-4">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-pink-500 text-white'
                        : 'bg-white border border-gray-200 shadow-sm'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 p-3 rounded-lg shadow-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <span className="text-sm text-gray-500 ml-2">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex-1 flex flex-col justify-end pb-6">
            <div className="text-center text-gray-500">
              <Brain className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">AI assistance ready</p>
              <p className="text-sm">Ask questions or start a session to receive real-time coaching</p>
            </div>
          </div>
        )}

        {/* Session-based AI suggestions - Compact at bottom */}
        {sessionActive && aiSuggestion && (
          <div className="flex-shrink-0 mt-4 space-y-3">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">{aiSuggestion.suggestion}</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Confidence: {aiSuggestion.confidence}% • Framework: {aiSuggestion.framework || 'General'}
                  </p>
                </div>
              </div>
            </div>
            {analytics.wordsPerMinute > 0 && analytics.wordsPerMinute >= 120 && analytics.wordsPerMinute <= 150 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-900">Great pace! Maintain current speaking speed</p>
                    <p className="text-xs text-green-700 mt-1">
                      Your current {analytics.wordsPerMinute} WPM is in the optimal range for clear communication.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
