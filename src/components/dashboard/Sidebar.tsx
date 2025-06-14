
import { memo } from "react";

export const Sidebar = memo(() => {
  return (
    <div className="space-y-6">
      {/* Sidebar is now empty - no components added without user request */}
    </div>
  );
});

Sidebar.displayName = 'Sidebar';
