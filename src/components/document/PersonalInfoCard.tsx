
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Phone, Linkedin, Github } from "lucide-react";
import { DocumentAnalysis } from "@/services/documentProcessingService";

interface PersonalInfoCardProps {
  personalInfo: DocumentAnalysis['personalInfo'];
}

const PersonalInfoCard = ({ personalInfo }: PersonalInfoCardProps) => {
  return (
    <Card className="border-pink-100">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5 text-pink-600" />
          <span>Personal Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{personalInfo.name}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{personalInfo.email || 'Not provided'}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{personalInfo.phone || 'Not provided'}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Linkedin className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{personalInfo.linkedin || 'Not provided'}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Github className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{personalInfo.github || 'Not provided'}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalInfoCard;
