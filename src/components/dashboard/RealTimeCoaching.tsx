
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, Clock, Volume2, Target, TrendingUp, AlertTriangle } from "lucide-react";
import { SpeechAnalytics } from "@/services/speechService";
import { useCoachingTips, CoachingTip } from "@/hooks/useCoachingTips";

interface RealTimeCoachingProps {
  analytics: SpeechAnalytics;
  transcript: string;
  sessionActive: boolean;
}

export const RealTimeCoaching = ({ analytics, transcript, sessionActive }: RealTimeCoachingProps) => {
  const { activeTips, dismissTip } = useCoachingTips(analytics, transcript, sessionActive);

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
