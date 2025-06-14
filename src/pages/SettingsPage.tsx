
import SettingsPanel from "@/components/SettingsPanel";
import { useNavigate } from "react-router-dom";

const SettingsPage = () => {
  const navigate = useNavigate();

  return <SettingsPanel onNavigate={(tab: string) => navigate(`/${tab}`)} />;
};

export default SettingsPage;
