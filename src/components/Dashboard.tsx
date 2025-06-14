import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  FileText, 
  BarChart3, 
  Settings, 
  Brain,
  Clock,
  Target,
  TrendingUp,
  Users
} from "lucide-react";
import { speechService, SpeechAnalytics } from "@/services/speechService";
import { aiService, AIResponse } from "@/services/aiService";
import { chromeStorage } from "@/utils/chromeStorage";

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

const Dashboard = ({ onNavigate }: DashboardProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [analytics, setAnalytics] = useState<SpeechAnalytics>({
    wordsPerMinute: 0,
    fillerWords: 0,
    pauseDuration: 0,
    confidenceScore: 0
  });
  const [aiSuggestion, setAiSuggestion] = useState<AIResponse | null>(null);
  const [sessionDuration, setSessionDuration] = useState("00:00");

  const sessionStats = {
    duration: "12:34",
    wordsPerMinute: 142,
    fillerWords: 8,
    confidenceScore: 87,
    questionsAnswered: 12
  };

  const recentSessions = [
    { id: 1, type: "Technical Interview", duration: "45:23", score: 89, date: "2024-06-13" },
    { id: 2, type: "Behavioral Interview", duration: "32:15", score: 92, date: "2024-06-12" },
    { id: 3, type: "System Design", duration: "38:47", score: 85, date: "2024-06-11" }
  ];

  const aiProviders = [
    { name: "OpenAI GPT-4", status: "active", reliability: 98 },
    { name: "Anthropic Claude", status: "standby", reliability: 95 },
    { name: "Google Gemini", status: "standby", reliability: 92 }
  ];

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

  const handleStartSession = async () => {
    if (!sessionActive) {
      setSessionActive(true);
      setIsRecording(true);
      
      // Load AI configuration
      const settings = await chromeStorage.getSettings();
      if (settings.aiProvider.openaiKey) {
        await aiService.configure('openai', settings.aiProvider.openaiKey);
      }

      // Start speech recognition
      speechService.startListening({
        onTranscript: (text) => {
          setTranscript(text);
          // Generate AI suggestion for recent speech
          const recentText = text.split(' ').slice(-20).join(' ');
          if (recentText.length > 10) {
            generateAISuggestion(recentText);
          }
        },
        onAnalytics: (newAnalytics) => {
          setAnalytics(newAnalytics);
        },
        onError: (error) => {
          console.error('Speech recognition error:', error);
        }
      });
    } else {
      setSessionActive(false);
      setIsRecording(false);
      speechService.stopListening();
      
      // Save session data
      const sessionData = {
        id: Date.now(),
        type: "Live Interview",
        duration: sessionDuration,
        transcript,
        analytics,
        date: new Date().toISOString().split('T')[0]
      };
      await chromeStorage.saveSession(sessionData);
    }
  };

  const generateAISuggestion = async (text: string) => {
    try {
      const suggestion = await aiService.generateSuggestion(text, 'behavioral', 'star');
      setAiSuggestion(suggestion);
    } catch (error) {
      console.error('AI suggestion error:', error);
    }
  };

  const toggleRecording = () => {
    if (sessionActive) {
      if (isRecording) {
        speechService.stopListening();
      } else {
        speechService.startListening({
          onTranscript: setTranscript,
          onAnalytics: setAnalytics
        });
      }
      setIsRecording(!isRecording);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-pink-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onNavigate("landing")}
                className="text-gray-600 hover:text-pink-600"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">CandidAI Dashboard</h1>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onNavigate("documents")}
                className="border-pink-200 text-pink-600 hover:bg-pink-50"
              >
                <FileText className="h-4 w-4 mr-2" />
                Documents
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onNavigate("analytics")}
                className="border-pink-200 text-pink-600 hover:bg-pink-50"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onNavigate("settings")}
                className="border-pink-200 text-pink-600 hover:bg-pink-50"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Session Control */}
        <Card className="mb-8 border-pink-100">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-pink-100 to-rose-100 rounded-lg text-pink-600">
                <Mic className="h-5 w-5" />
              </div>
              <span>Interview Session Control</span>
              {sessionActive && (
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  Live Session
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Start your AI-assisted interview session with real-time analysis and suggestions.
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
                      Start Interview
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

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Real-time Stats */}
            {sessionActive && (
              <Card className="border-pink-100">
                <CardHeader>
                  <CardTitle className="text-lg">Live Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-pink-600">{analytics.wordsPerMinute}</div>
                      <div className="text-sm text-gray-500">WPM</div>
                      <div className="text-xs text-green-600">
                        {analytics.wordsPerMinute >= 120 && analytics.wordsPerMinute <= 150 ? 'Optimal' : 'Adjust Pace'}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{analytics.fillerWords}</div>
                      <div className="text-sm text-gray-500">Filler Words</div>
                      <div className="text-xs text-orange-600">
                        {analytics.fillerWords < 5 ? 'Good' : 'Monitor Usage'}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{analytics.confidenceScore}%</div>
                      <div className="text-sm text-gray-500">Confidence</div>
                      <div className="text-xs text-blue-600">
                        {analytics.confidenceScore > 80 ? 'Strong' : 'Building'}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{transcript.split(' ').length}</div>
                      <div className="text-sm text-gray-500">Words</div>
                      <div className="text-xs text-purple-600">Spoken</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Suggestions */}
            <Card className="border-pink-100">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-pink-600" />
                  <span>AI Assistant</span>
                </CardTitle>
                <CardDescription>
                  Real-time suggestions and coaching during your interview
                </CardDescription>
              </CardHeader>
              <CardContent>
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
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>AI assistance will appear here during your interview session</p>
                    <p className="text-sm mt-2">Start a session to receive real-time coaching and suggestions</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Transcript Display */}
            {sessionActive && transcript && (
              <Card className="border-pink-100">
                <CardHeader>
                  <CardTitle className="text-lg">Live Transcript</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg max-h-48 overflow-y-auto">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{transcript}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Sessions */}
            <Card className="border-pink-100">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-pink-600" />
                  <span>Recent Sessions</span>
                </CardTitle>
                <CardDescription>
                  Your latest interview performance history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-rose-100 rounded-lg flex items-center justify-center">
                          <Target className="h-5 w-5 text-pink-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{session.type}</p>
                          <p className="text-xs text-gray-500">{session.date} • {session.duration}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                          {session.score}%
                        </Badge>
                        <Button variant="ghost" size="sm" className="text-pink-600 hover:text-pink-700">
                          View Report
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Provider Status */}
            <Card className="border-pink-100">
              <CardHeader>
                <CardTitle className="text-lg">AI Provider Status</CardTitle>
                <CardDescription>
                  Multi-LLM integration with intelligent fallback
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiProviders.map((provider, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          provider.status === 'active' ? 'bg-green-500' : 'bg-gray-300'
                        }`}></div>
                        <span className="text-sm font-medium">{provider.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">{provider.reliability}%</div>
                        <Badge variant="secondary" className={`text-xs ${
                          provider.status === 'active' 
                            ? 'bg-green-100 text-green-700 border-green-200' 
                            : 'bg-gray-100 text-gray-700 border-gray-200'
                        }`}>
                          {provider.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-pink-100">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-pink-200 text-pink-600 hover:bg-pink-50"
                  onClick={() => onNavigate("documents")}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Upload Resume
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-pink-200 text-pink-600 hover:bg-pink-50"
                  onClick={() => onNavigate("analytics")}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-pink-200 text-pink-600 hover:bg-pink-50"
                  onClick={() => onNavigate("settings")}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Configure AI
                </Button>
              </CardContent>
            </Card>

            {/* Performance Overview */}
            <Card className="border-pink-100">
              <CardHeader>
                <CardTitle className="text-lg">Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Overall Score</span>
                      <span className="font-medium">87%</span>
                    </div>
                    <Progress value={87} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Communication</span>
                      <span className="font-medium">92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Technical Skills</span>
                      <span className="font-medium">85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Confidence</span>
                      <span className="font-medium">89%</span>
                    </div>
                    <Progress value={89} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
