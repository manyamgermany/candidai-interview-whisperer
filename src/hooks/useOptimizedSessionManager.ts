
import { useOptimizedSessionManager as useOptimizedSessionManagerImpl } from './session/useOptimizedSessionManagerImpl';

export { useOptimizedSessionManager };
export type { OptimizedSessionState } from './session/sessionTypes';

const useOptimizedSessionManager = useOptimizedSessionManagerImpl;
