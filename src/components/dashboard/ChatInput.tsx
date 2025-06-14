
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, MessageSquare } from "lucide-react";
import { aiService } from "@/services/aiService";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: number;
}

interface ChatInputProps {
  onMessagesUpdate: (messages: ChatMessage[]) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const ChatInput = ({ onMessagesUpdate, onLoadingChange }: ChatInputProps) => {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: Date.now()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    onMessagesUpdate(updatedMessages);
    setInput("");
    setIsLoading(true);
    onLoadingChange(true);

    try {
      const response = await aiService.generateSuggestion(
        `User is asking about: "${input}". Provide helpful interview advice or suggestions related to this topic.`,
        'general',
        'prep'
      );

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response.suggestion,
        timestamp: Date.now()
      };

      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);
      onMessagesUpdate(finalMessages);
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      onLoadingChange(false);
    }
  };

  return (
    <Card className="border-pink-100">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-3">
            <MessageSquare className="h-5 w-5 text-pink-600" />
            <h3 className="text-lg font-semibold">Quick AI Assistant</h3>
          </div>

          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about interviews, keywords, or topics..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              size="sm"
              disabled={isLoading || !input.trim()}
              className="bg-pink-500 hover:bg-pink-600 text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          
          <p className="text-xs text-gray-500 text-center">
            Type keywords or questions to get instant AI suggestions for your interview
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
