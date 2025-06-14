
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, Save, Edit3 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

interface ProjectsManagerProps {
  form: UseFormReturn<any>;
}

const ProjectsManager = ({ form }: ProjectsManagerProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    role: "",
    duration: "",
    url: "",
    technologies: [] as string[],
    achievements: [] as string[]
  });
  const [newTech, setNewTech] = useState("");
  const [newAchievement, setNewAchievement] = useState("");

  const addProject = () => {
    if (newProject.name.trim() && newProject.description.trim()) {
      const currentProjects = form.getValues("projects") || [];
      if (editingIndex !== null) {
        currentProjects[editingIndex] = newProject;
        setEditingIndex(null);
      } else {
        currentProjects.push(newProject);
      }
      form.setValue("projects", currentProjects);
      resetForm();
    }
  };

  const editProject = (index: number) => {
    const projects = form.getValues("projects");
    setNewProject(projects[index]);
    setEditingIndex(index);
    setIsAdding(true);
  };

  const removeProject = (index: number) => {
    const currentProjects = form.getValues("projects");
    form.setValue("projects", currentProjects.filter((_: any, i: number) => i !== index));
  };

  const resetForm = () => {
    setNewProject({
      name: "",
      description: "",
      role: "",
      duration: "",
      url: "",
      technologies: [],
      achievements: []
    });
    setIsAdding(false);
    setEditingIndex(null);
  };

  const addTechnology = () => {
    if (newTech.trim() && !newProject.technologies.includes(newTech.trim())) {
      setNewProject(prev => ({
        ...prev,
        technologies: [...prev.technologies, newTech.trim()]
      }));
      setNewTech("");
    }
  };

  const removeTechnology = (tech: string) => {
    setNewProject(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== tech)
    }));
  };

  const addAchievement = () => {
    if (newAchievement.trim()) {
      setNewProject(prev => ({
        ...prev,
        achievements: [...prev.achievements, newAchievement.trim()]
      }));
      setNewAchievement("");
    }
  };

  const removeAchievement = (index: number) => {
    setNewProject(prev => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
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
        <div className="p-4 border rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Project Name *</label>
              <Input
                value={newProject.name}
                onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                placeholder="E-commerce Platform"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Your Role *</label>
              <Input
                value={newProject.role}
                onChange={(e) => setNewProject(prev => ({ ...prev, role: e.target.value }))}
                placeholder="Full-stack Developer"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Duration</label>
              <Input
                value={newProject.duration}
                onChange={(e) => setNewProject(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="3 months"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Project URL</label>
              <Input
                value={newProject.url}
                onChange={(e) => setNewProject(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://github.com/user/project"
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">Description *</label>
            <Textarea
              value={newProject.description}
              onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the project and your contributions"
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Technologies</label>
            <div className="flex space-x-2 mb-2">
              <Input
                value={newTech}
                onChange={(e) => setNewTech(e.target.value)}
                placeholder="React, Node.js, etc."
                onKeyPress={(e) => handleKeyPress(e, addTechnology)}
              />
              <Button type="button" onClick={addTechnology} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {newProject.technologies.map((tech, index) => (
                <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                  <span>{tech}</span>
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeTechnology(tech)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Key Achievements</label>
            <div className="flex space-x-2 mb-2">
              <Input
                value={newAchievement}
                onChange={(e) => setNewAchievement(e.target.value)}
                placeholder="Increased performance by 40%"
                onKeyPress={(e) => handleKeyPress(e, addAchievement)}
              />
              <Button type="button" onClick={addAchievement} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-1">
              {newProject.achievements.map((achievement, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{achievement}</span>
                  <X 
                    className="h-4 w-4 cursor-pointer text-gray-500" 
                    onClick={() => removeAchievement(index)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex space-x-2">
            <Button type="button" onClick={addProject} size="sm">
              <Save className="h-4 w-4 mr-2" />
              {editingIndex !== null ? 'Update Project' : 'Save Project'}
            </Button>
            <Button type="button" onClick={resetForm} variant="outline" size="sm">
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Display existing projects with edit options */}
      {form.watch("projects") && form.watch("projects").length > 0 && (
        <div className="space-y-2">
          {form.watch("projects").map((project: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <span className="font-medium">{project.name}</span>
                <span className="text-gray-500 text-sm ml-2">({project.role})</span>
              </div>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => editProject(index)}
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeProject(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsManager;
