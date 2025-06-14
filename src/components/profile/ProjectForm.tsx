
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, Save } from "lucide-react";

interface Project {
  name: string;
  description: string;
  role: string;
  duration: string;
  url: string;
  technologies: string[];
  achievements: string[];
}

interface ProjectFormProps {
  onSave: (project: Project) => void;
  onCancel: () => void;
  initialProject?: Project;
  isEditing?: boolean;
}

const ProjectForm = ({ onSave, onCancel, initialProject, isEditing = false }: ProjectFormProps) => {
  const [project, setProject] = useState<Project>(
    initialProject || {
      name: "",
      description: "",
      role: "",
      duration: "",
      url: "",
      technologies: [],
      achievements: []
    }
  );
  const [newTech, setNewTech] = useState("");
  const [newAchievement, setNewAchievement] = useState("");

  const handleSave = () => {
    if (project.name.trim() && project.description.trim()) {
      onSave(project);
    }
  };

  const addTechnology = () => {
    if (newTech.trim() && !project.technologies.includes(newTech.trim())) {
      setProject(prev => ({
        ...prev,
        technologies: [...prev.technologies, newTech.trim()]
      }));
      setNewTech("");
    }
  };

  const removeTechnology = (tech: string) => {
    setProject(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== tech)
    }));
  };

  const addAchievement = () => {
    if (newAchievement.trim()) {
      setProject(prev => ({
        ...prev,
        achievements: [...prev.achievements, newAchievement.trim()]
      }));
      setNewAchievement("");
    }
  };

  const removeAchievement = (index: number) => {
    setProject(prev => ({
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
    <div className="p-4 border rounded-lg space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Project Name *</label>
          <Input
            value={project.name}
            onChange={(e) => setProject(prev => ({ ...prev, name: e.target.value }))}
            placeholder="E-commerce Platform"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Your Role *</label>
          <Input
            value={project.role}
            onChange={(e) => setProject(prev => ({ ...prev, role: e.target.value }))}
            placeholder="Full-stack Developer"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Duration</label>
          <Input
            value={project.duration}
            onChange={(e) => setProject(prev => ({ ...prev, duration: e.target.value }))}
            placeholder="3 months"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Project URL</label>
          <Input
            value={project.url}
            onChange={(e) => setProject(prev => ({ ...prev, url: e.target.value }))}
            placeholder="https://github.com/user/project"
          />
        </div>
      </div>
      
      <div>
        <label className="text-sm font-medium">Description *</label>
        <Textarea
          value={project.description}
          onChange={(e) => setProject(prev => ({ ...prev, description: e.target.value }))}
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
          {project.technologies.map((tech, index) => (
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
          {project.achievements.map((achievement, index) => (
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
        <Button type="button" onClick={handleSave} size="sm">
          <Save className="h-4 w-4 mr-2" />
          {isEditing ? 'Update Project' : 'Save Project'}
        </Button>
        <Button type="button" onClick={onCancel} variant="outline" size="sm">
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default ProjectForm;
