
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain } from "lucide-react";
import { DocumentAnalysis } from "@/services/documentProcessingService";

interface SkillsAnalysisCardProps {
  skills: DocumentAnalysis['skills'];
}

const SkillsAnalysisCard = ({ skills }: SkillsAnalysisCardProps) => {
  return (
    <Card className="border-pink-100">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-pink-600" />
          <span>Skills Analysis</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-sm text-gray-900 mb-3">Technical Skills</h4>
            <div className="flex flex-wrap gap-2">
              {skills.technical.map((skill, index) => (
                <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                  {skill}
                </Badge>
              ))}
              {skills.technical.length === 0 && (
                <span className="text-sm text-gray-500">No technical skills detected</span>
              )}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-sm text-gray-900 mb-3">Soft Skills</h4>
            <div className="flex flex-wrap gap-2">
              {skills.soft.map((skill, index) => (
                <Badge key={index} variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                  {skill}
                </Badge>
              ))}
              {skills.soft.length === 0 && (
                <span className="text-sm text-gray-500">No soft skills detected</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SkillsAnalysisCard;
