// src/components/Workspace/ProjectCard.tsx
import React from "react";
import Link from "next/link";

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    description: string;
  };
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <Link href={`/workspace/${project.id}`}>
      <div className="bg-white rounded-lg shadow-md p-4 cursor-pointer">
        <h3 className="text-lg font-semibold mb-2">{project.name}</h3>
        <p className="text-gray-600">{project.description}</p>
      </div>
    </Link>
  );
};

export default ProjectCard;
