
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Briefcase } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

interface ExperienceTabProps {
  form: UseFormReturn<any>;
}

const ExperienceTab = ({ form }: ExperienceTabProps) => {
  const experience = form.watch("experience");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="h-5 w-5" />
          <span>Professional Experience</span>
        </CardTitle>
        <CardDescription>
          Your work experience and achievements
        </CardDescription>
      </CardHeader>
      <CardContent>
        {experience && experience.length > 0 ? (
          <div className="space-y-4">
            {experience.map((exp: any, index: number) => (
              <div key={index} className="p-4 border rounded-lg">
                <h4 className="font-medium">{exp.title}</h4>
                <p className="text-gray-600">{exp.company} • {exp.duration}</p>
                {exp.highlights && exp.highlights.length > 0 && (
                  <ul className="mt-2 list-disc list-inside text-sm text-gray-700">
                    {exp.highlights.map((highlight: string, i: number) => (
                      <li key={i}>{highlight}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No experience data available.</p>
            <p className="text-sm text-gray-500 mt-1">
              Upload a resume or add experience manually in the Documents tab.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExperienceTab;
