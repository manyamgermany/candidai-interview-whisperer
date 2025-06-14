interface SidebarProps {
  onViewChange: (view: 'dashboard' | 'profile' | 'simulator' | 'reports' | 'config' | 'history') => void;
}

export const Sidebar = ({
  onViewChange
}: SidebarProps) => {
  return (
    <div className="space-y-6">
      {/* Minimal sidebar - no distracting elements */}
    </div>
  );
};
