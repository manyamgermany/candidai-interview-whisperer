
import React, { memo, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { SessionData } from "@/types/chromeStorageTypes";
import { SessionCard } from './MemoizedSessionCard';

interface VirtualizedSessionListProps {
  sessions: SessionData[];
  onDeleteSession: (sessionId: string) => void;
  onViewSession: (sessionId: string) => void;
  height?: number;
}

const VirtualizedSessionList = memo(({ 
  sessions, 
  onDeleteSession, 
  onViewSession,
  height = 400 
}: VirtualizedSessionListProps) => {
  const itemRenderer = useMemo(() => {
    return ({ index, style }: { index: number; style: React.CSSProperties }) => {
      const session = sessions[index];
      return (
        <div style={style} className="px-2 py-1">
          <SessionCard 
            session={session}
            onDelete={onDeleteSession}
            onView={onViewSession}
          />
        </div>
      );
    };
  }, [sessions, onDeleteSession, onViewSession]);

  if (sessions.length === 0) {
    return null;
  }

  return (
    <List
      height={height}
      itemCount={sessions.length}
      itemSize={220} // Approximate height of each session card
      width="100%"
    >
      {itemRenderer}
    </List>
  );
});

VirtualizedSessionList.displayName = 'VirtualizedSessionList';

export { VirtualizedSessionList };
