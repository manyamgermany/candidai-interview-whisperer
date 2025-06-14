
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Play, Pause, Clock } from "lucide-react";
import { speechService } from "@/services/speech/speechService";
import { aiService } from "@/services/aiService";
import { chromeStorage } from "@/utils/chromeStorage";

interface SessionControlProps {
  onSessionChange: (active: boolean) => void;
  onTranscriptChange: (transcript: string) => void;
  onAnalyticsChange: (analytics: any) => void;
  onAISuggestionChange: (suggestion: any) => void;
}

export const SessionControl = ({ 
  onSessionChange, 
  onTranscriptChange, 
  onAnalyticsChange, 
  onAISuggestionChange 
}: SessionControlProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionDuration, setSessionDuration] = useState("00:00");
  const [currentAnalytics, setCurrentAnalytics] = useState({
    wordsPerMinute: 0,
    fillerWords: 0,
    confidenceScore: 0
  });
  const [currentTranscript, setCurrentTranscript] = useState("");

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (sessionActive) {
      const startTime = Date.now();
      interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        setSessionDuration(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionActive]);

  const generateAISuggestion = async (text: string) => {
    try {
      const suggestion = await aiService.generateSuggestion(text, 'behavioral', 'star');
      onAISuggestionChange(suggestion);
    } catch (error) {
      console.error('AI suggestion error:', error);
    }
  };

  const handleStartSession = async () => {
    if (!sessionActive) {
      setSessionActive(true);
      setIsRecording(true);
      onSessionChange(true);
      
      const settings = await chromeStorage.getSettings();
      if (settings.aiProvider.openaiKey) {
        await aiService.configure('openai', settings.aiProvider.openaiKey);
      }

      speechService.startListening({
        onTranscript: (text) => {
          setCurrentTranscript(text);
          onTranscriptChange(text);
          const recentText = text.split(' ').slice(-20).join(' ');
          if (recentText.length > 10) {
            generateAISuggestion(recentText);
          }
        },
        onAnalytics: (newAnalytics) => {
          setCurrentAnalytics({
            wordsPerMinute: newAnalytics.wordsPerMinute || 0,
            fillerWords: newAnalytics.fillerWords || 0,
            confidenceScore: newAnalytics.confidenceScore || 0
          });
          onAnalyticsChange(newAnalytics);
        },
        onError: (error) => {
          console.error('Speech recognition error:', error);
        }
      });
    } else {
      setSessionActive(false);
      setIsRecording(false);
      onSessionChange(false);
      speechService.stopListening();
      
      // Save session data with correct analytics structure
      const sessionData = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        platform: "Live Meeting",
        duration: parseFloat(sessionDuration.replace(':', '.')),
        transcript: currentTranscript,
        analytics: currentAnalytics,
        suggestions: []
      };
      await chromeStorage.saveSession(sessionData);
    }
  };

  const toggleRecording = () => {
    if (sessionActive) {
      if (isRecording) {
        speechService.stopListening();
      } else {
        speechService.startListening({
          onTranscript: (text) => {
            setCurrentTranscript(text);
            onTranscriptChange(text);
          },
          onAnalytics: (newAnalytics) => {
            setCurrentAnalytics({
              wordsPerMinute: newAnalytics.wordsPerMinute || 0,
              fillerWords: newAnalytics.fillerWords || 0,
              confidenceScore: newAnalytics.confidenceScore || 0
            });
            onAnalyticsChange(newAnalytics);
          }
        });
      }
      setIsRecording(!isRecording);
    }
  };

  return (
    <Card className="border-pink-100">
      <CardHeader>
        <CardTitle className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-pink-100 to-rose-100 rounded-lg text-pink-600">
            <Mic className="h-5 w-5" />
          </div>
          <span>Meeting Session Control</span>
          {sessionActive && (
            <Badge className="bg-green-100 text-green-700 border-green-200">
              Live Session
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Start your AI-assisted meeting session with real-time analysis and suggestions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              size="lg"
              onClick={handleStartSession}
              className={`${
                sessionActive 
                  ? "bg-red-500 hover:bg-red-600" 
                  : "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
              } text-white px-8`}
            >
              {sessionActive ? (
                <>
                  <Pause className="h-5 w-5 mr-2" />
                  End Session
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 mr-2" />
                  Start Meeting
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={toggleRecording}
              disabled={!sessionActive}
              className="border-pink-200 text-pink-600 hover:bg-pink-50"
            >
              {isRecording ? (
                <>
                  <MicOff className="h-4 w-4 mr-2" />
                  Mute
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4 mr-2" />
                  Unmute
                </>
              )}
            </Button>
          </div>
          {sessionActive && (
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="font-mono">{sessionDuration}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                <span className={isRecording ? 'text-green-600' : 'text-gray-500'}>
                  {isRecording ? 'Recording' : 'Paused'}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
