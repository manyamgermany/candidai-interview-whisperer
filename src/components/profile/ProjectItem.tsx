
import { Button } from "@/components/ui/button";
import { Edit3, X } from "lucide-react";

interface Project {
  name: string;
  description: string;
  role: string;
  duration: string;
  url: string;
  technologies: string[];
  achievements: string[];
}

interface ProjectItemProps {
  project: Project;
  index: number;
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
}

const ProjectItem = ({ project, index, onEdit, onRemove }: ProjectItemProps) => {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div>
        <span className="font-medium">{project.name}</span>
        <span className="text-gray-500 text-sm ml-2">({project.role})</span>
      </div>
      <div className="flex space-x-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onEdit(index)}
        >
          <Edit3 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onRemove(index)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ProjectItem;
