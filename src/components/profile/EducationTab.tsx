
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import CertificationsManager from "./CertificationsManager";

interface EducationTabProps {
  form: UseFormReturn<any>;
}

const EducationTab = ({ form }: EducationTabProps) => {
  const education = form.watch("education");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <GraduationCap className="h-5 w-5" />
          <span>Education & Certifications</span>
        </CardTitle>
        <CardDescription>
          Your educational background and professional certifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-medium mb-3">Education</h4>
          {education && education.length > 0 ? (
            <div className="space-y-3">
              {education.map((edu: any, index: number) => (
                <div key={index} className="p-3 border rounded-lg">
                  <h5 className="font-medium">{edu.degree}</h5>
                  <p className="text-gray-600">{edu.institution} • {edu.year}</p>
                  {edu.gpa && <p className="text-sm text-gray-500">GPA: {edu.gpa}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No education data available.</p>
          )}
        </div>

        <CertificationsManager form={form} />
      </CardContent>
    </Card>
  );
};

export default EducationTab;
