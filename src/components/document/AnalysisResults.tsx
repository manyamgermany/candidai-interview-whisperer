
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload } from "lucide-react";
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents Processed</h3>
          <p className="text-gray-500 mb-6">
            Upload your resume to get started with AI-powered analysis and insights.
          </p>
          <Button
            onClick={onUploadClick}
            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Resume
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PersonalInfoCard personalInfo={analysis.personalInfo} />
      <SkillsAnalysisCard skills={analysis.skills} />
      <AIInsightsCard insights={analysis.insights} />
    </div>
  );
};

export default AnalysisResults;
