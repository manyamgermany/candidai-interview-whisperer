
import { memo } from "react";

export const LoadingState = memo(() => {
  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
        <p className="text-gray-600 mt-2">Loading AI configuration...</p>
      </div>
    </div>
  );
});

LoadingState.displayName = 'LoadingState';
