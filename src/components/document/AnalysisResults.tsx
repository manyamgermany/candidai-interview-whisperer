
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload, UserPlus, CheckCircle, Clock } from "lucide-react";
import { DocumentAnalysis } from "@/services/documentProcessingService";
import PersonalInfoCard from "./PersonalInfoCard";
import SkillsAnalysisCard from "./SkillsAnalysisCard";
import AIInsightsCard from "./AIInsightsCard";

interface AnalysisResultsProps {
  analysis?: DocumentAnalysis;
  onUploadClick: () => void;
  onManualCreate?: () => void;
  isProcessing?: boolean;
  processingStep?: string;
}

const AnalysisResults = ({ 
  analysis, 
  onUploadClick, 
  onManualCreate, 
  isProcessing = false,
  processingStep = ''
}: AnalysisResultsProps) => {
  // Show processing state
  if (isProcessing) {
    return (
      <Card className="border-blue-100">
        <CardContent className="text-center py-16">
          <Clock className="h-16 w-16 text-blue-400 mx-auto mb-4 animate-pulse" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Processing Your Resume</h3>
          <p className="text-gray-500 mb-4">
            {processingStep || 'Analyzing your document and extracting insights...'}
          </p>
          <div className="w-32 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-blue-400 rounded-full animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show empty state if no analysis
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
              onClick={onManualCreate}
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

  // Show completed analysis
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h2 className="text-xl font-semibold text-gray-900">Profile Analysis</h2>
          <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-100 px-3 py-1 rounded-full">
            <CheckCircle className="h-4 w-4" />
            <span>Analysis Complete</span>
          </div>
        </div>
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
