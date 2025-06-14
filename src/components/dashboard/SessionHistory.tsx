
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { History, Download, Eye, Calendar, Clock, BarChart3, Star } from "lucide-react";
import { chromeStorage } from "@/utils/chromeStorage";

interface SessionData {
  id: string;
  timestamp: number;
  platform: string;
  duration: number;
  transcript: string;
  analytics: any;
  performanceReport?: any;
}

export const SessionHistory = () => {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const sessionData = await chromeStorage.getAllSessions();
      setSessions(sessionData.sort((a, b) => b.timestamp - a.timestamp));
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportSession = (session: SessionData) => {
    const exportData = {
      session_info: {
        id: session.id,
        date: new Date(session.timestamp).toISOString(),
        platform: session.platform,
        duration_minutes: Math.round(session.duration),
      },
      performance_metrics: session.performanceReport?.metrics || {},
      transcript: session.transcript,
      analytics: session.analytics,
      recommendations: session.performanceReport?.recommendations || []
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session_${session.id}_${new Date(session.timestamp).toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 1) return '<1m';
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    return `${hours}h ${remainingMinutes}m`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <Card className="border-pink-100">
        <CardContent className="p-6">
          <div className="text-center">Loading session history...</div>
        </CardContent>
      </Card>
    );
  }

  if (selectedSession) {
    return (
      <Card className="border-pink-100">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-pink-600" />
              <span>Session Details</span>
            </CardTitle>
            <Button
              variant="outline"
              onClick={() => setSelectedSession(null)}
              size="sm"
            >
              Back to History
            </Button>
          </div>
          <CardDescription>
            {new Date(selectedSession.timestamp).toLocaleDateString()} • {selectedSession.platform}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Session Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Clock className="h-6 w-6 text-gray-400 mx-auto mb-1" />
              <div className="font-semibold">{formatDuration(selectedSession.duration)}</div>
              <div className="text-xs text-gray-500">Duration</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <BarChart3 className="h-6 w-6 text-gray-400 mx-auto mb-1" />
              <div className="font-semibold">{selectedSession.analytics?.totalWords || 0}</div>
              <div className="text-xs text-gray-500">Words</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Star className="h-6 w-6 text-gray-400 mx-auto mb-1" />
              <div className={`font-semibold ${getScoreColor(selectedSession.performanceReport?.metrics?.overallScore || 0)}`}>
                {selectedSession.performanceReport?.metrics?.overallScore || 'N/A'}%
              </div>
              <div className="text-xs text-gray-500">Score</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="font-semibold">{selectedSession.analytics?.wordsPerMinute || 0}</div>
              <div className="text-xs text-gray-500">WPM</div>
            </div>
          </div>

          {/* Performance Metrics */}
          {selectedSession.performanceReport?.metrics && (
            <div className="space-y-3">
              <h4 className="font-medium">Performance Breakdown</h4>
              {Object.entries(selectedSession.performanceReport.metrics).map(([key, value]) => {
                if (key === 'overallScore') return null;
                const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{label}</span>
                      <span className={getScoreColor(value as number)}>{value}%</span>
                    </div>
                    <Progress value={value as number} className="h-2" />
                  </div>
                );
              })}
            </div>
          )}

          {/* Transcript Preview */}
          <div className="space-y-2">
            <h4 className="font-medium">Transcript Preview</h4>
            <div className="bg-gray-50 p-4 rounded-lg max-h-32 overflow-y-auto">
              <p className="text-sm text-gray-700">
                {selectedSession.transcript.slice(0, 300)}
                {selectedSession.transcript.length > 300 && '...'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <Button
              onClick={() => exportSession(selectedSession)}
              variant="outline"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Session
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-pink-100">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <History className="h-5 w-5 text-pink-600" />
          <span>Session History</span>
        </CardTitle>
        <CardDescription>
          Review your past sessions and track your progress over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <div className="text-center py-8">
            <History className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="font-medium text-gray-900 mb-1">No sessions yet</h3>
            <p className="text-gray-500">Complete your first AI meeting to see session history</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.slice(0, 10).map((session) => (
              <div
                key={session.id}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium">
                        {new Date(session.timestamp).toLocaleDateString()}
                      </span>
                      <Badge variant="outline">{session.platform}</Badge>
                      <span className="text-sm text-gray-500">
                        {formatDuration(session.duration)}
                      </span>
                      {session.performanceReport?.metrics?.overallScore && (
                        <span className={`text-sm font-medium ${getScoreColor(session.performanceReport.metrics.overallScore)}`}>
                          {session.performanceReport.metrics.overallScore}%
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {new Date(session.timestamp).toLocaleTimeString()} • 
                      {session.analytics?.totalWords || 0} words
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedSession(session)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportSession(session)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {sessions.length > 10 && (
              <div className="text-center pt-4">
                <p className="text-sm text-gray-500">
                  Showing recent 10 sessions of {sessions.length} total
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
