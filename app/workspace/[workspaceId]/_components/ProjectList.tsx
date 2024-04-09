'use client';
'use client';

import { Tables } from '@/types_db';

type Project = Tables<'projects'>;

interface ProjectListProps {
  projects: Project[];
}

export default function ProjectList({ projects }: ProjectListProps) {
  return (
    <div className="mt-4">
      <h3 className="text-xl font-semibold">Project List</h3>
      {/* Add project list implementation */}
      <ul>
        {projects.map((project) => (
          <li key={project.id}>{project.name}</li>
        ))}
      </ul>
    </div>
  );
}
