
import { useState, useCallback } from "react";
import { UseFormReturn } from "react-hook-form";

export interface ProjectData {
  name: string;
  description: string;
  role: string;
  duration: string;
  url: string;
  technologies: string[];
  achievements: string[];
}

export const useProjectManager = (form: UseFormReturn<any>) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleSaveProject = useCallback((project: ProjectData) => {
    const currentProjects = form.getValues("projects") || [];
    
    if (editingIndex !== null) {
      currentProjects[editingIndex] = project;
      setEditingIndex(null);
    } else {
      currentProjects.push(project);
    }
    
    form.setValue("projects", currentProjects);
    setIsAdding(false);
  }, [form, editingIndex]);

  const handleEditProject = useCallback((index: number) => {
    setEditingIndex(index);
    setIsAdding(true);
  }, []);

  const handleRemoveProject = useCallback((index: number) => {
    const currentProjects = form.getValues("projects");
    form.setValue("projects", currentProjects.filter((_: any, i: number) => i !== index));
  }, [form]);

  const handleCancel = useCallback(() => {
    setIsAdding(false);
    setEditingIndex(null);
  }, []);

  const getEditingProject = useCallback((): ProjectData | undefined => {
    if (editingIndex !== null) {
      const projects = form.getValues("projects");
      return projects[editingIndex];
    }
    return undefined;
  }, [form, editingIndex]);

  return {
    isAdding,
    editingIndex,
    setIsAdding,
    handleSaveProject,
    handleEditProject,
    handleRemoveProject,
    handleCancel,
    getEditingProject,
  };
};
