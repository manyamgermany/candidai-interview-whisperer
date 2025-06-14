
import ProjectItem from "./ProjectItem";

interface Project {
  name: string;
  description: string;
  role: string;
  duration: string;
  url: string;
  technologies: string[];
  achievements: string[];
}

interface ProjectListProps {
  projects: Project[];
  onEditProject: (index: number) => void;
  onRemoveProject: (index: number) => void;
}

const ProjectList = ({ projects, onEditProject, onRemoveProject }: ProjectListProps) => {
  if (!projects || projects.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {projects.map((project, index) => (
        <ProjectItem
          key={index}
          project={project}
          index={index}
          onEdit={onEditProject}
          onRemove={onRemoveProject}
        />
      ))}
    </div>
  );
};

export default ProjectList;
