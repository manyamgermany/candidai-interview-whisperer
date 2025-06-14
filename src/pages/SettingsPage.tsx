
import SettingsPanel from "@/components/SettingsPanel";

const SettingsPage = () => {
  return <SettingsPanel onNavigate={(tab: string) => window.location.href = `/${tab}`} />;
};

export default SettingsPage;
