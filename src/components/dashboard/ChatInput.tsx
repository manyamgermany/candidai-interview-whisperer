
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { aiService } from "@/services/aiService";
import { ChatMessage } from "@/types/chatTypes";
import { buildInterviewContext } from "@/utils/promptUtils";
import { useUserProfile } from "@/hooks/useUserProfile";
import { SpeechAnalytics } from "@/services/speechService";

interface ChatInputProps {
  onMessagesUpdate: (updater: (prev: ChatMessage[]) => ChatMessage[]) => void;
  onLoadingChange: (loading: boolean) => void;
  sessionActive: boolean;
  currentTranscript: string;
  analytics?: SpeechAnalytics;
}

export const ChatInput = ({ 
  onMessagesUpdate, 
  onLoadingChange, 
  sessionActive, 
  currentTranscript,
  analytics 
}: ChatInputProps) => {
  const [inputValue, setInputValue] = useState("");
  const { profile } = useUserProfile();

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: Date.now()
    };

    onMessagesUpdate(prev => [...prev, userMessage]);
    setInputValue("");
    onLoadingChange(true);

    try {
      const contextualMessage = buildInterviewContext(
        inputValue.trim(),
        sessionActive,
        currentTranscript,
        analytics
      );

      const aiResponse = await aiService.generateSuggestion(
        contextualMessage,
        profile?.interviewType || 'general',
        'conversational'
      );

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse.suggestion,
        timestamp: Date.now()
      };

      onMessagesUpdate(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: Date.now()
      };
      onMessagesUpdate(prev => [...prev, errorMessage]);
    } finally {
      onLoadingChange(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex space-x-2">
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Ask for interview advice, tips, or practice questions..."
        className="flex-1"
      />
      <Button 
        onClick={handleSendMessage}
        disabled={!inputValue.trim()}
        size="sm"
        className="bg-pink-500 hover:bg-pink-600"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
};
