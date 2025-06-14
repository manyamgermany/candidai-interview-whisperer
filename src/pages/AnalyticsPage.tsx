
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";

const AnalyticsPage = () => {
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
            <h1 className="text-2xl font-bold text-gray-900">Performance Analytics</h1>
            <p className="text-gray-600">View your session analytics and progress</p>
          </div>
        </div>
        
        <AnalyticsDashboard onNavigate={handleNavigate} />
      </div>
    </div>
  );
};

export default AnalyticsPage;
