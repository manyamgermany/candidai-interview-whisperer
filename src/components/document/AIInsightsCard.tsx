
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertCircle, Brain } from "lucide-react";
import { DocumentAnalysis } from "@/services/documentProcessingService";

interface AIInsightsCardProps {
  insights: DocumentAnalysis['insights'];
}

const AIInsightsCard = ({ insights }: AIInsightsCardProps) => {
  return (
    <Card className="border-pink-100">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-pink-600" />
          <span>AI Insights & Recommendations</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Overall Resume Score</span>
              <span className="text-lg font-bold text-pink-600">{insights.overallScore}%</span>
            </div>
            <Progress value={insights.overallScore} className="h-2" />
          </div>

          <div>
            <h4 className="font-medium text-sm text-gray-900 mb-3">Strengths</h4>
            <div className="space-y-2">
              {insights.strengths.map((strength, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{strength}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-sm text-gray-900 mb-3">Areas for Improvement</h4>
            <div className="space-y-2">
              {insights.improvements.map((improvement, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{improvement}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-sm text-gray-900 mb-3">AI Recommendations</h4>
            <div className="space-y-2">
              {insights.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <Brain className="h-4 w-4 text-pink-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIInsightsCard;
