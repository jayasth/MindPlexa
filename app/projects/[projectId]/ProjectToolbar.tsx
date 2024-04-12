import { Projects } from '@/types/database/projects';

type Project = Projects['Row'];

interface ProjectToolbarProps {
  project: Project;
}

const ProjectToolbar: React.FC<ProjectToolbarProps> = ({ project }) => {
  const handleShare = () => {
    // Implement share functionality
    console.log('Sharing project:', project.name);
  };

  const handleExport = () => {
    // Implement export functionality
    console.log('Exporting project:', project.name);
  };

  return (
    <div className="flex items-center mb-8">
      <button
        onClick={handleShare}
        className="px-4 py-2 mr-4 font-bold text-white bg-green-500 rounded-md hover:bg-green-600"
      >
        Share
      </button>
      <button
        onClick={handleExport}
        className="px-4 py-2 font-bold text-white bg-blue-500 rounded-md hover:bg-blue-600"
      >
        Export
      </button>
    </div>
  );
};

export default ProjectToolbar;
