
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Briefcase, ExternalLink } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import ProjectsManager from "./ProjectsManager";

interface ProjectsTabProps {
  form: UseFormReturn<any>;
}

const ProjectsTab = ({ form }: ProjectsTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Briefcase className="h-5 w-5" />
          <span>Recent Projects</span>
        </CardTitle>
        <CardDescription>
          Showcase your key projects and achievements for interviews
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="projects"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Projects</FormLabel>
              <FormControl>
                <ProjectsManager form={form} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {form.watch("projects") && form.watch("projects").length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium">Your Projects</h4>
            {form.watch("projects").map((project: any, index: number) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h5 className="font-medium">{project.name}</h5>
                    <p className="text-gray-600 text-sm mt-1">{project.description}</p>
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {project.technologies.map((tech: string, i: number) => (
                          <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                    {project.achievements && project.achievements.length > 0 && (
                      <ul className="mt-2 list-disc list-inside text-sm text-gray-700">
                        {project.achievements.map((achievement: string, i: number) => (
                          <li key={i}>{achievement}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {project.url && (
                    <a 
                      href={project.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-4 text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {project.role} • {project.duration}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectsTab;
