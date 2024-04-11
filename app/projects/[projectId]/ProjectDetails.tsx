import { Tables } from '@/types_db';
import ProjectForm from '../ProjectForm';

type Project = Tables<'projects'>;

interface ProjectDetailsProps {
  project: Project;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project }) => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">{project.name}</h1>
      <p className="text-gray-600 mb-8">{project.description}</p>
      <h2 className="text-2xl font-bold mb-4">Edit Project</h2>
      <ProjectForm project={project} />
    </div>
  );
};

export default ProjectDetails;
