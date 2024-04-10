import React from 'react';
import { Tables } from '@/types_db';

type Project = Tables<'projects'>;

interface ProjectDetailsProps {
  project: Project;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project }) => {
  return (
    <div className="project-details">
      <h2>{project.name}</h2>
      <p>{project.description}</p>
      {/* Add more project details */}
    </div>
  );
};

export default ProjectDetails;
