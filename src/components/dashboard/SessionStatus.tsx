
import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface SessionStatusProps {
  sessionActive: boolean;
  sessionDuration: string;
  isRecording: boolean;
}

export const SessionStatus = memo(({
  sessionActive,
  sessionDuration,
  isRecording
}: SessionStatusProps) => {
  if (!sessionActive) return null;

  return (
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
  );
});

SessionStatus.displayName = 'SessionStatus';
