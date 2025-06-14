
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PerformanceReport } from "@/types/interviewTypes";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SessionControl } from "@/components/dashboard/SessionControl";
import { AIAssistant } from "@/components/dashboard/AIAssistant";
import { RealTimeCoaching } from "@/components/dashboard/RealTimeCoaching";
import { ChatInput } from "@/components/dashboard/ChatInput";
import { ChatMessage } from "@/types/chatTypes";
import { useOptimizedSessionManager } from "@/hooks/useOptimizedSessionManager";
import { AISuggestion } from "@/services/aiSuggestionService";

const DashboardPage = () => {
  const navigate = useNavigate();
  
  const handlePerformanceReport = (report: PerformanceReport) => {
    navigate('/reports', { state: { latestReport: report } });
  };
  
  const {
    sessionState,
    startSession,
    stopSession,
    toggleRecording,
    isGeneratingReport,
    setSuggestion,
  } = useOptimizedSessionManager({ onPerformanceReportGenerated: handlePerformanceReport });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex flex-col">
      <DashboardHeader onNavigate={(tab: string) => navigate(`/${tab}`)} />

      <div className="flex-1 flex flex-col">
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 flex flex-col flex-1">
          {/* Top section - 1/4 of space - Compact layout */}
          <div className="h-1/4 min-h-[200px] max-h-[300px] flex flex-col space-y-3 mb-4">
            {/* Session Control - More compact */}
            <div className="flex-shrink-0">
              <SessionControl
                sessionState={sessionState}
                startSession={startSession}
                stopSession={stopSession}
                toggleRecording={toggleRecording}
                isGeneratingReport={isGeneratingReport}
                onAISuggestionChange={setSuggestion}
              />
            </div>

            {/* Real-time Coaching - Compact version */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <RealTimeCoaching 
                analytics={sessionState.analytics}
                transcript={sessionState.transcript}
                sessionActive={sessionState.isActive}
              />
            </div>
          </div>

          {/* AI Assistant - 3/4 of space - Bottom aligned to chat input */}
          <div className="flex-1 min-h-0 flex flex-col justify-end" style={{ minHeight: '60vh' }}>
            <div className="flex-1 min-h-0">
              <AIAssistant 
                sessionActive={sessionState.isActive}
                aiSuggestion={sessionState.currentSuggestion}
                analytics={sessionState.analytics}
                chatMessages={chatMessages}
                isLoading={isChatLoading}
              />
            </div>
          </div>

          {/* Chat Input - Fixed at bottom with top border */}
          <div className="flex-shrink-0 border-t border-pink-100 pt-3">
            <ChatInput 
              onMessagesUpdate={setChatMessages}
              onLoadingChange={setIsChatLoading}
              sessionActive={sessionState.isActive}
              currentTranscript={sessionState.transcript}
              analytics={sessionState.analytics}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
