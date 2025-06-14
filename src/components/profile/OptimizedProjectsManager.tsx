
import React, { memo } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { useProjectManager } from "@/hooks/useProjectManager";
import ProjectForm from "./ProjectForm";
import ProjectList from "./ProjectList";

interface OptimizedProjectsManagerProps {
  form: UseFormReturn<any>;
}

const OptimizedProjectsManager = memo(({ form }: OptimizedProjectsManagerProps) => {
  const {
    isAdding,
    handleSaveProject,
    handleEditProject,
    handleRemoveProject,
    handleCancel,
    getEditingProject,
    setIsAdding,
  } = useProjectManager(form);

  const projects = form.watch("projects") || [];

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
          isEditing={getEditingProject() !== undefined}
        />
      )}

      <ProjectList
        projects={projects}
        onEditProject={handleEditProject}
        onRemoveProject={handleRemoveProject}
      />
    </div>
  );
});

OptimizedProjectsManager.displayName = "OptimizedProjectsManager";

export default OptimizedProjectsManager;
