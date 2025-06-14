
import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Play, Pause, BarChart3 } from "lucide-react";

interface SessionActionsProps {
  sessionActive: boolean;
  isRecording: boolean;
  isGeneratingReport: boolean;
  onStartSession: () => void;
  onToggleRecording: () => void;
}

export const SessionActions = memo(({
  sessionActive,
  isRecording,
  isGeneratingReport,
  onStartSession,
  onToggleRecording
}: SessionActionsProps) => {
  return (
    <div className="flex items-center space-x-4">
      <Button
        size="lg"
        onClick={onStartSession}
        disabled={isGeneratingReport}
        className={`${
          sessionActive 
            ? "bg-red-500 hover:bg-red-600" 
            : "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
        } text-white px-8`}
      >
        {isGeneratingReport ? (
          <>
            <BarChart3 className="h-5 w-5 mr-2 animate-pulse" />
            Generating Report...
          </>
        ) : sessionActive ? (
          <>
            <Pause className="h-5 w-5 mr-2" />
            End & Analyze Session
          </>
        ) : (
          <>
            <Play className="h-5 w-5 mr-2" />
            Start AI Meeting
          </>
        )}
      </Button>
      <Button
        variant="outline"
        onClick={onToggleRecording}
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
  );
});

SessionActions.displayName = 'SessionActions';
