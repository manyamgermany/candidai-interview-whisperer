// This file is now deprecated - functionality moved to SessionControl.tsx
// Keeping as placeholder to avoid breaking imports

import { memo } from "react";

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
  // Functionality moved to SessionControl component
  return null;
});

SessionActions.displayName = 'SessionActions';
