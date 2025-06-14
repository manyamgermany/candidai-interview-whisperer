
import { SessionData } from '@/utils/chromeStorage';

export interface ProcessedAnalytics {
  performanceData: Array<{
    date: string;
    confidence: number;
    wpm: number;
    fillerWords: number;
  }>;
  sessionMetrics: Array<{
    metric: string;
    value: string;
    change: string;
    trend: 'up' | 'down';
  }>;
  interviewTypeData: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  recentSessions: Array<{
    id: string;
    date: string;
    type: string;
    duration: string;
    confidence: number;
    wpm: number;
    fillerWords: number;
    score: string;
    feedback: string;
  }>;
}

export class AnalyticsDataProcessor {
  static processSessionData(sessions: SessionData[], selectedPeriod: string): ProcessedAnalytics {
    const filteredSessions = this.filterSessionsByPeriod(sessions, selectedPeriod);
    
    return {
      performanceData: this.generatePerformanceData(filteredSessions),
      sessionMetrics: this.calculateSessionMetrics(filteredSessions, sessions),
      interviewTypeData: this.calculateInterviewTypeDistribution(filteredSessions),
      recentSessions: this.formatRecentSessions(filteredSessions.slice(0, 10))
    };
  }

  private static filterSessionsByPeriod(sessions: SessionData[], period: string): SessionData[] {
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (period) {
      case '7d':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        cutoffDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        cutoffDate.setDate(now.getDate() - 30);
    }

    return sessions.filter(session => session.timestamp >= cutoffDate.getTime());
  }

  private static generatePerformanceData(sessions: SessionData[]) {
    if (sessions.length === 0) return [];

    // Group sessions by date and calculate averages
    const groupedByDate = sessions.reduce((acc, session) => {
      const date = new Date(session.timestamp).toISOString().split('T')[0];
      if (!acc[date]) acc[date] = [];
      acc[date].push(session);
      return acc;
    }, {} as Record<string, SessionData[]>);

    return Object.entries(groupedByDate)
      .map(([date, dateSessions]) => ({
        date,
        confidence: Math.round(
          dateSessions.reduce((sum, s) => sum + s.analytics.confidenceScore, 0) / dateSessions.length
        ),
        wpm: Math.round(
          dateSessions.reduce((sum, s) => sum + s.analytics.wordsPerMinute, 0) / dateSessions.length
        ),
        fillerWords: Math.round(
          dateSessions.reduce((sum, s) => sum + s.analytics.fillerWords, 0) / dateSessions.length
        )
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-10); // Last 10 data points
  }

  private static calculateSessionMetrics(currentSessions: SessionData[], allSessions: SessionData[]) {
    if (currentSessions.length === 0) {
      return [
        { metric: 'Average Duration', value: '0:00', change: '+0%', trend: 'up' as const },
        { metric: 'Success Rate', value: '0%', change: '+0%', trend: 'up' as const },
        { metric: 'Confidence Score', value: '0', change: '+0%', trend: 'up' as const },
        { metric: 'WPM Average', value: '0', change: '+0%', trend: 'up' as const }
      ];
    }

    const avgDuration = currentSessions.reduce((sum, s) => sum + s.duration, 0) / currentSessions.length;
    const avgConfidence = currentSessions.reduce((sum, s) => sum + s.analytics.confidenceScore, 0) / currentSessions.length;
    const avgWPM = currentSessions.reduce((sum, s) => sum + s.analytics.wordsPerMinute, 0) / currentSessions.length;
    const successRate = (currentSessions.filter(s => s.analytics.confidenceScore >= 80).length / currentSessions.length) * 100;

    // Calculate changes compared to previous period
    const previousPeriodSessions = this.getPreviousPeriodSessions(allSessions, currentSessions);
    const changes = this.calculateChanges(currentSessions, previousPeriodSessions);

    return [
      {
        metric: 'Average Duration',
        value: this.formatDuration(avgDuration),
        change: `${changes.duration >= 0 ? '+' : ''}${changes.duration.toFixed(1)}%`,
        trend: changes.duration >= 0 ? 'up' as const : 'down' as const
      },
      {
        metric: 'Success Rate',
        value: `${Math.round(successRate)}%`,
        change: `${changes.successRate >= 0 ? '+' : ''}${changes.successRate.toFixed(1)}%`,
        trend: changes.successRate >= 0 ? 'up' as const : 'down' as const
      },
      {
        metric: 'Confidence Score',
        value: Math.round(avgConfidence).toString(),
        change: `${changes.confidence >= 0 ? '+' : ''}${changes.confidence.toFixed(1)}%`,
        trend: changes.confidence >= 0 ? 'up' as const : 'down' as const
      },
      {
        metric: 'WPM Average',
        value: Math.round(avgWPM).toString(),
        change: `${changes.wpm >= 0 ? '+' : ''}${changes.wpm.toFixed(1)}%`,
        trend: changes.wpm >= 0 ? 'up' as const : 'down' as const
      }
    ];
  }

  private static getPreviousPeriodSessions(allSessions: SessionData[], currentSessions: SessionData[]): SessionData[] {
    if (currentSessions.length === 0) return [];
    
    const currentStart = Math.min(...currentSessions.map(s => s.timestamp));
    const currentEnd = Math.max(...currentSessions.map(s => s.timestamp));
    const periodLength = currentEnd - currentStart;
    
    const previousEnd = currentStart;
    const previousStart = previousEnd - periodLength;
    
    return allSessions.filter(s => s.timestamp >= previousStart && s.timestamp < previousEnd);
  }

  private static calculateChanges(current: SessionData[], previous: SessionData[]) {
    if (previous.length === 0) {
      return { duration: 0, successRate: 0, confidence: 0, wpm: 0 };
    }

    const currentAvgs = {
      duration: current.reduce((sum, s) => sum + s.duration, 0) / current.length,
      confidence: current.reduce((sum, s) => sum + s.analytics.confidenceScore, 0) / current.length,
      wpm: current.reduce((sum, s) => sum + s.analytics.wordsPerMinute, 0) / current.length,
      successRate: (current.filter(s => s.analytics.confidenceScore >= 80).length / current.length) * 100
    };

    const previousAvgs = {
      duration: previous.reduce((sum, s) => sum + s.duration, 0) / previous.length,
      confidence: previous.reduce((sum, s) => sum + s.analytics.confidenceScore, 0) / previous.length,
      wpm: previous.reduce((sum, s) => sum + s.analytics.wordsPerMinute, 0) / previous.length,
      successRate: (previous.filter(s => s.analytics.confidenceScore >= 80).length / previous.length) * 100
    };

    return {
      duration: ((currentAvgs.duration - previousAvgs.duration) / previousAvgs.duration) * 100,
      confidence: ((currentAvgs.confidence - previousAvgs.confidence) / previousAvgs.confidence) * 100,
      wpm: ((currentAvgs.wpm - previousAvgs.wpm) / previousAvgs.wpm) * 100,
      successRate: ((currentAvgs.successRate - previousAvgs.successRate) / previousAvgs.successRate) * 100
    };
  }

  private static calculateInterviewTypeDistribution(sessions: SessionData[]) {
    const types = sessions.reduce((acc, session) => {
      const type = this.categorizeSession(session);
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = sessions.length;
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
    
    return Object.entries(types)
      .map(([name, count], index) => ({
        name,
        value: Math.round((count / total) * 100),
        color: colors[index % colors.length]
      }))
      .sort((a, b) => b.value - a.value);
  }

  private static categorizeSession(session: SessionData): string {
    const platform = session.platform.toLowerCase();
    
    if (platform.includes('technical') || session.transcript.includes('algorithm') || session.transcript.includes('coding')) {
      return 'Technical';
    }
    if (platform.includes('behavioral') || session.transcript.includes('tell me about') || session.transcript.includes('describe a time')) {
      return 'Behavioral';
    }
    if (platform.includes('system') || session.transcript.includes('design') || session.transcript.includes('architecture')) {
      return 'System Design';
    }
    if (session.transcript.includes('leadership') || session.transcript.includes('manage') || session.transcript.includes('team')) {
      return 'Leadership';
    }
    
    return 'General';
  }

  private static formatRecentSessions(sessions: SessionData[]) {
    return sessions.map(session => ({
      id: session.id,
      date: new Date(session.timestamp).toISOString().split('T')[0],
      type: this.categorizeSession(session) + ' Interview',
      duration: this.formatDuration(session.duration),
      confidence: session.analytics.confidenceScore,
      wpm: session.analytics.wordsPerMinute,
      fillerWords: session.analytics.fillerWords,
      score: this.calculateScore(session.analytics.confidenceScore),
      feedback: session.suggestions[0] || 'Good performance overall'
    }));
  }

  private static calculateScore(confidence: number): string {
    if (confidence >= 90) return 'Excellent';
    if (confidence >= 80) return 'Very Good';
    if (confidence >= 70) return 'Good';
    if (confidence >= 60) return 'Fair';
    return 'Needs Improvement';
  }

  private static formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}
