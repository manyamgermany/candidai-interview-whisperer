
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import ProjectForm from "./ProjectForm";
import ProjectList from "./ProjectList";

interface Project {
  name: string;
  description: string;
  role: string;
  duration: string;
  url: string;
  technologies: string[];
  achievements: string[];
}

interface ProjectsManagerProps {
  form: UseFormReturn<any>;
}

const ProjectsManager = ({ form }: ProjectsManagerProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleSaveProject = (project: Project) => {
    const currentProjects = form.getValues("projects") || [];
    
    if (editingIndex !== null) {
      currentProjects[editingIndex] = project;
      setEditingIndex(null);
    } else {
      currentProjects.push(project);
    }
    
    form.setValue("projects", currentProjects);
    setIsAdding(false);
  };

  const handleEditProject = (index: number) => {
    setEditingIndex(index);
    setIsAdding(true);
  };

  const handleRemoveProject = (index: number) => {
    const currentProjects = form.getValues("projects");
    form.setValue("projects", currentProjects.filter((_: any, i: number) => i !== index));
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingIndex(null);
  };

  const getEditingProject = (): Project | undefined => {
    if (editingIndex !== null) {
      const projects = form.getValues("projects");
      return projects[editingIndex];
    }
    return undefined;
  };

  return (
    <div className="space-y-4">
      {!isAdding ? (
        <Button 
          type="button" 
          onClick={() => setIsAdding(true)} 
          variant="outline"
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </Button>
      ) : (
        <ProjectForm
          onSave={handleSaveProject}
          onCancel={handleCancel}
          initialProject={getEditingProject()}
          isEditing={editingIndex !== null}
        />
      )}

      <ProjectList
        projects={form.watch("projects") || []}
        onEditProject={handleEditProject}
        onRemoveProject={handleRemoveProject}
      />
    </div>
  );
};

export default ProjectsManager;
