'use client';

import type { Tables } from 'types_db';
import Link from 'next/link';

type Project = Tables<'projects'>;

interface ProjectListProps {
  projects: Project[];
}

const ProjectList: React.FC<ProjectListProps> = ({ projects }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {projects.map((project) => (
        <div key={project.id} className="bg-white shadow-md rounded-lg p-6">
          <Link href={`/projects/${project.id}`}>
            <h2 className="text-xl font-semibold mb-4">{project.name}</h2>
          </Link>
          <p className="text-gray-600">{project.description}</p>
        </div>
      ))}
    </div>
  );
};

export default ProjectList;
