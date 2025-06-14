
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import SettingsPanel from "@/components/SettingsPanel";

const SettingsPage = () => {
  const navigate = useNavigate();

  const handleNavigate = (tab: string) => {
    if (tab === "back") {
      navigate("/");
    } else {
      navigate(`/${tab}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center space-x-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => handleNavigate("back")}
            className="text-gray-600 hover:text-pink-600"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Application Settings</h1>
            <p className="text-gray-600">Configure your AI and application preferences</p>
          </div>
        </div>
        
        <SettingsPanel onNavigate={handleNavigate} />
      </div>
    </div>
  );
};

export default SettingsPage;
