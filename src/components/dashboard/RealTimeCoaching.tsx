
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MessageCircle, Clock, Volume2, Target, TrendingUp, AlertTriangle } from "lucide-react";
import { SpeechAnalytics } from "@/services/speechService";

interface RealTimeCoachingProps {
  analytics: SpeechAnalytics;
  transcript: string;
  sessionActive: boolean;
}

interface CoachingTip {
  id: string;
  type: 'pace' | 'clarity' | 'confidence' | 'structure' | 'filler';
  severity: 'low' | 'medium' | 'high';
  message: string;
  suggestion: string;
  timestamp: number;
}

export const RealTimeCoaching = ({ analytics, transcript, sessionActive }: RealTimeCoachingProps) => {
  const [activeTips, setActiveTips] = useState<CoachingTip[]>([]);
  const [dismissedTips, setDismissedTips] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!sessionActive) return;

    const newTips: CoachingTip[] = [];
    const currentTime = Date.now();

    // Speaking pace coaching
    if (analytics.wordsPerMinute > 0) {
      if (analytics.wordsPerMinute < 100) {
        newTips.push({
          id: `pace-slow-${currentTime}`,
          type: 'pace',
          severity: 'medium',
          message: 'Speaking quite slowly',
          suggestion: 'Try to increase your pace slightly to maintain engagement',
          timestamp: currentTime
        });
      } else if (analytics.wordsPerMinute > 180) {
        newTips.push({
          id: `pace-fast-${currentTime}`,
          type: 'pace',
          severity: 'high',
          message: 'Speaking very fast',
          suggestion: 'Slow down to ensure clarity and comprehension',
          timestamp: currentTime
        });
      }
    }

    // Filler words coaching
    const words = transcript.split(' ');
    const recentWords = words.slice(-50); // Last 50 words
    const fillerWords = ['um', 'uh', 'like', 'you know', 'actually', 'basically'];
    const fillerCount = recentWords.filter(word => 
      fillerWords.includes(word.toLowerCase().replace(/[^\w]/g, ''))
    ).length;
    
    if (fillerCount > 3) {
      newTips.push({
        id: `filler-${currentTime}`,
        type: 'filler',
        severity: 'medium',
        message: 'High filler word usage detected',
        suggestion: 'Take brief pauses instead of using filler words',
        timestamp: currentTime
      });
    }

    // Confidence coaching based on language patterns
    const recentText = words.slice(-30).join(' ').toLowerCase();
    const uncertainWords = ['maybe', 'i think', 'probably', 'not sure', 'kind of'];
    const uncertainCount = uncertainWords.filter(word => recentText.includes(word)).length;
    
    if (uncertainCount > 2) {
      newTips.push({
        id: `confidence-${currentTime}`,
        type: 'confidence',
        severity: 'medium',
        message: 'Language suggests uncertainty',
        suggestion: 'Use more definitive language to project confidence',
        timestamp: currentTime
      });
    }

    // Structure coaching
    const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length > 0) {
      const lastSentence = sentences[sentences.length - 1];
      const wordCount = lastSentence.split(' ').length;
      
      if (wordCount > 40) {
        newTips.push({
          id: `structure-${currentTime}`,
          type: 'structure',
          severity: 'low',
          message: 'Very long sentence detected',
          suggestion: 'Break down complex ideas into shorter sentences',
          timestamp: currentTime
        });
      }
    }

    // Filter out dismissed tips and duplicates
    const filteredTips = newTips.filter(tip => 
      !dismissedTips.has(tip.id) && 
      !activeTips.some(existing => existing.type === tip.type && existing.severity === tip.severity)
    );

    if (filteredTips.length > 0) {
      setActiveTips(prev => [...prev.slice(-4), ...filteredTips].slice(-5)); // Keep last 5 tips
    }
  }, [analytics, transcript, sessionActive]);

  const dismissTip = (tipId: string) => {
    setDismissedTips(prev => new Set([...prev, tipId]));
    setActiveTips(prev => prev.filter(tip => tip.id !== tipId));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'low': return <TrendingUp className="h-4 w-4 text-blue-600" />;
      default: return <MessageCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pace': return <Volume2 className="h-4 w-4" />;
      case 'confidence': return <Target className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  if (!sessionActive || activeTips.length === 0) {
    return (
      <Card className="border-green-100">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-800">
            <Target className="h-5 w-5" />
            <span>Real-time Coaching</span>
          </CardTitle>
          <CardDescription>
            {sessionActive ? "You're doing great! Keep it up." : "Start a session to receive live coaching tips"}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-pink-100">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageCircle className="h-5 w-5 text-pink-600" />
          <span>Live Coaching</span>
          <Badge className="bg-pink-100 text-pink-700">
            {activeTips.length} Active
          </Badge>
        </CardTitle>
        <CardDescription>Real-time suggestions to improve your performance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {activeTips.map((tip) => (
          <div
            key={tip.id}
            className={`p-4 rounded-lg border ${getSeverityColor(tip.severity)}`}
          >
            <div className="flex items-start justify-between space-x-3">
              <div className="flex items-start space-x-3 flex-1">
                <div className="flex items-center space-x-2">
                  {getSeverityIcon(tip.severity)}
                  {getTypeIcon(tip.type)}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{tip.message}</h4>
                  <p className="text-xs text-gray-600 mt-1">{tip.suggestion}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismissTip(tip.id)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
