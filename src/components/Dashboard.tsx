
import { useState } from "react";
import { SpeechAnalytics } from "@/services/speechService";
import { AIResponse } from "@/services/aiService";
import { PerformanceReport } from "@/types/interviewTypes";
import { DashboardHeader } from "./dashboard/DashboardHeader";
import { SessionControl } from "./dashboard/SessionControl";
import { LiveMetrics } from "./dashboard/LiveMetrics";
import { AIAssistant } from "./dashboard/AIAssistant";
import { TranscriptDisplay } from "./dashboard/TranscriptDisplay";
import { RecentSessions } from "./dashboard/RecentSessions";
import { Sidebar } from "./dashboard/Sidebar";
import { ProfileManager } from "./profile/ProfileManager";
import { PerformanceReports } from "./dashboard/PerformanceReports";
import { InterviewSimulator } from "./dashboard/InterviewSimulator";

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

const Dashboard = ({ onNavigate }: DashboardProps) => {
  const [sessionActive, setSessionActive] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [analytics, setAnalytics] = useState<SpeechAnalytics>({
    wordsPerMinute: 0,
    fillerWords: 0,
    pauseDuration: 0,
    confidenceScore: 0,
    totalWords: 0,
    speakingTime: 0
  });
  const [aiSuggestion, setAiSuggestion] = useState<AIResponse | null>(null);
  const [activeView, setActiveView] = useState<'dashboard' | 'profile' | 'simulator' | 'reports'>('dashboard');
  const [latestPerformanceReport, setLatestPerformanceReport] = useState<PerformanceReport | null>(null);

  const handlePerformanceReport = (report: PerformanceReport) => {
    setLatestPerformanceReport(report);
    setActiveView('reports');
  };

  if (activeView === 'profile') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
        <DashboardHeader onNavigate={onNavigate} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <button
              onClick={() => setActiveView('dashboard')}
              className="text-pink-600 hover:text-pink-700 font-medium"
            >
              ← Back to Dashboard
            </button>
          </div>
          <ProfileManager />
        </div>
      </div>
    );
  }

  if (activeView === 'simulator') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
        <DashboardHeader onNavigate={onNavigate} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <button
              onClick={() => setActiveView('dashboard')}
              className="text-pink-600 hover:text-pink-700 font-medium"
            >
              ← Back to Dashboard
            </button>
          </div>
          <InterviewSimulator />
        </div>
      </div>
    );
  }

  if (activeView === 'reports') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
        <DashboardHeader onNavigate={onNavigate} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <button
              onClick={() => setActiveView('dashboard')}
              className="text-pink-600 hover:text-pink-700 font-medium"
            >
              ← Back to Dashboard
            </button>
          </div>
          <PerformanceReports latestReport={latestPerformanceReport} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      <DashboardHeader onNavigate={onNavigate} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Session Control */}
        <div className="mb-8">
          <SessionControl
            onSessionChange={setSessionActive}
            onTranscriptChange={setTranscript}
            onAnalyticsChange={setAnalytics}
            onAISuggestionChange={setAiSuggestion}
            onPerformanceReportGenerated={handlePerformanceReport}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Real-time Stats */}
            {sessionActive && (
              <LiveMetrics analytics={analytics} transcript={transcript} />
            )}

            {/* AI Suggestions */}
            <AIAssistant 
              sessionActive={sessionActive}
              aiSuggestion={aiSuggestion}
              analytics={analytics}
            />

            {/* Transcript Display */}
            {sessionActive && transcript && (
              <TranscriptDisplay transcript={transcript} />
            )}

            {/* Recent Sessions */}
            <RecentSessions />
          </div>

          {/* Sidebar */}
          <Sidebar 
            onNavigate={onNavigate}
            onViewChange={setActiveView}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
