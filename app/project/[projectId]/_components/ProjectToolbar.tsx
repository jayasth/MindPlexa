import React from 'react';
import { Tables } from '@/types_db';

type Project = Tables<'projects'>;

interface ProjectToolbarProps {
  project: Project;
}

const ProjectToolbar: React.FC<ProjectToolbarProps> = ({ project }) => {
  const handleEditProject = () => {
    console.log(`Editing project: ${project.name}`); // Example usage
    // Implement edit project functionality
  };

  const handleShareProject = () => {
    console.log(`Sharing project: ${project.name}`); // Example usage
    // Implement share project functionality
  };

  const handleDeleteProject = () => {
    console.log(`Deleting project ID: ${project.id}`); // Example usage
    // Implement delete project functionality
  };

  return (
    <div className="project-toolbar">
      <button onClick={handleEditProject}>Edit Project</button>
      <button onClick={handleShareProject}>Share Project</button>
      <button onClick={handleDeleteProject}>Delete Project</button>
    </div>
  );
};

export default ProjectToolbar;
