
import React, { memo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, BarChart3, Trash2 } from "lucide-react";
import { SessionData } from "@/types/storageTypes";

interface SessionCardProps {
  session: SessionData;
  onDelete: (sessionId: string) => void;
  onView: (sessionId: string) => void;
}

const SessionCard = memo(({ session, onDelete, onView }: SessionCardProps) => {
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'practice': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'real': return 'bg-green-100 text-green-700 border-green-200';
      case 'simulation': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="border-gray-200 hover:border-pink-200 transition-colors">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <Badge className={getTypeColor(session.type)}>
                {session.type.charAt(0).toUpperCase() + session.type.slice(1)}
              </Badge>
              <span className="text-sm text-gray-500 flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDate(session.date)}
              </span>
              <span className="text-sm text-gray-500 flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {formatDuration(session.duration)}
              </span>
            </div>
            
            <div className="mb-3">
              <div className="flex items-center space-x-3 mb-1">
                <span className="text-sm font-medium">Performance Score:</span>
                <span className={`font-bold ${getScoreColor(session.performance.score)}`}>
                  {session.performance.score}%
                </span>
              </div>
              <Progress value={session.performance.score} className="h-2" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Words per minute:</span>
                <span className="ml-2">{session.analytics.wordsPerMinute}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Total words:</span>
                <span className="ml-2">{session.analytics.totalWords}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Confidence:</span>
                <span className="ml-2">{Math.round(session.analytics.confidenceScore)}%</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Filler words:</span>
                <span className="ml-2">{session.analytics.fillerWords}</span>
              </div>
            </div>
          </div>

          <div className="flex space-x-2 ml-4">
            <Button variant="outline" size="sm" onClick={() => onView(session.id)}>
              <BarChart3 className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onDelete(session.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

SessionCard.displayName = 'SessionCard';

export { SessionCard };
