
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
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
  sessionActive?: boolean;
  currentTranscript?: string;
}

export const ChatInput = ({ 
  onMessagesUpdate, 
  onLoadingChange, 
  sessionActive = false,
  currentTranscript = ""
}: ChatInputProps) => {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { toast } = useToast();

  const buildInterviewContext = (keywords: string): string => {
    const baseContext = `You are an expert interview coach providing real-time assistance during an active interview/meeting session.`;
    
    let context = baseContext;
    
    // Add session context
    if (sessionActive) {
      context += ` The user is currently in an active interview session.`;
      
      if (currentTranscript && currentTranscript.trim().length > 0) {
        const recentTranscript = currentTranscript.split(' ').slice(-50).join(' ');
        context += ` Recent conversation context: "${recentTranscript}"`;
      }
    } else {
      context += ` The user is preparing for an interview.`;
    }
    
    // Add user profile context from localStorage
    const focusKeywords = JSON.parse(localStorage.getItem('userFocusKeywords') || '[]');
    const currentRole = localStorage.getItem('userCurrentRole') || '';
    const careerSummary = localStorage.getItem('userCareerSummary') || '';
    
    if (focusKeywords.length > 0) {
      context += ` User's focus keywords: ${focusKeywords.join(', ')}.`;
    }
    
    if (currentRole) {
      context += ` User's current/target role: ${currentRole}.`;
    }
    
    if (careerSummary) {
      context += ` User's background: ${careerSummary}.`;
    }
    
    // Add the user's specific query
    context += ` User is asking about: "${keywords}".`;
    
    context += ` Provide a concise, actionable response (2-3 sentences) that helps them respond effectively in an interview context. Focus on specific talking points, examples they could mention, or how to structure their answer using frameworks like STAR method when appropriate.`;
    
    return context;
  };

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
    
    const userInput = input.trim();
    setInput("");
    setIsLoading(true);
    onLoadingChange(true);

    try {
      // Build interview-specific context
      const interviewContext = buildInterviewContext(userInput);
      
      const response = await aiService.generateSuggestion(
        interviewContext,
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
  );
};
