
import { useState } from "react";
import { SpeechAnalytics } from "@/services/speechService";
import { AIResponse } from "@/services/aiService";
import { PerformanceReport } from "@/types/interviewTypes";
import { DashboardHeader } from "./dashboard/DashboardHeader";
import { SessionControl } from "./dashboard/SessionControl";
import { AIAssistant } from "./dashboard/AIAssistant";
import { RealTimeCoaching } from "./dashboard/RealTimeCoaching";
import { ProfileManager } from "./profile/ProfileManager";
import { PerformanceReports } from "./dashboard/PerformanceReports";
import { InterviewSimulator } from "./dashboard/InterviewSimulator";
import { SessionHistory } from "./dashboard/SessionHistory";
import { AIConfigPanel } from "./dashboard/AIConfigPanel";
import { ChatInput } from "./dashboard/ChatInput";

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: number;
}

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
  const [activeView, setActiveView] = useState<'dashboard' | 'profile' | 'simulator' | 'reports' | 'config' | 'history'>('dashboard');
  const [latestPerformanceReport, setLatestPerformanceReport] = useState<PerformanceReport | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const handlePerformanceReport = (report: PerformanceReport) => {
    setLatestPerformanceReport(report);
    setActiveView('reports');
  };

  // Handle other views
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

  if (activeView === 'history') {
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
          <SessionHistory />
        </div>
      </div>
    );
  }

  if (activeView === 'config') {
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
          <AIConfigPanel />
        </div>
      </div>
    );
  }

  // Main dashboard view - clean and minimalistic
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      <DashboardHeader onNavigate={onNavigate} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Session Control - Main Focus */}
        <div className="mb-8">
          <SessionControl
            onSessionChange={setSessionActive}
            onTranscriptChange={setTranscript}
            onAnalyticsChange={setAnalytics}
            onAISuggestionChange={setAiSuggestion}
            onPerformanceReportGenerated={handlePerformanceReport}
          />
        </div>

        {/* Main Content - Focused on Interview */}
        <div className="space-y-6">
          {/* Real-time Coaching */}
          <RealTimeCoaching 
            analytics={analytics}
            transcript={transcript}
            sessionActive={sessionActive}
          />

          {/* AI Assistant */}
          <AIAssistant 
            sessionActive={sessionActive}
            aiSuggestion={aiSuggestion}
            analytics={analytics}
            chatMessages={chatMessages}
            isLoading={isChatLoading}
          />
        </div>

        {/* Chat Input at the Bottom */}
        <div className="mt-8">
          <ChatInput 
            onMessagesUpdate={setChatMessages}
            onLoadingChange={setIsChatLoading}
            sessionActive={sessionActive}
            currentTranscript={transcript}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
