
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload, UserPlus } from "lucide-react";
import { DocumentAnalysis } from "@/services/documentProcessingService";
import PersonalInfoCard from "./PersonalInfoCard";
import SkillsAnalysisCard from "./SkillsAnalysisCard";
import AIInsightsCard from "./AIInsightsCard";

interface AnalysisResultsProps {
  analysis?: DocumentAnalysis;
  onUploadClick: () => void;
}

const AnalysisResults = ({ analysis, onUploadClick }: AnalysisResultsProps) => {
  if (!analysis) {
    return (
      <Card className="border-pink-100">
        <CardContent className="text-center py-16">
          <FileText className="h-16 w-16 text-pink-200 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Profile Created Yet</h3>
          <p className="text-gray-500 mb-6">
            Upload your resume for AI-powered analysis or create a manual profile to get started.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={onUploadClick}
              className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Resume
            </Button>
            <Button
              onClick={() => window.location.reload()} // This will be handled by parent component
              variant="outline"
              className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Create Manual Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Profile Analysis</h2>
        <div className="text-sm text-gray-500">
          Ready for interview assistance
        </div>
      </div>
      <PersonalInfoCard personalInfo={analysis.personalInfo} />
      <SkillsAnalysisCard skills={analysis.skills} />
      <AIInsightsCard insights={analysis.insights} />
    </div>
  );
};

export default AnalysisResults;
