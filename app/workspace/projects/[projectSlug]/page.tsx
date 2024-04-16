import React from 'react';
import Link from 'next/link';

interface ProjectPageProps {
  params: {
    projectSlug: string;
  };
}

const ProjectPage: React.FC<ProjectPageProps> = ({ params }) => {
  const { projectSlug } = params;

  // Fetch the project details based on the projectSlug from your database or API
  const project = {
    id: 'project-id',
    slug: projectSlug,
    name: 'Project Name',
    description: 'Project Description'
    // Add other project details as needed
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{project.name}</h1>
      <p className="text-gray-600">{project.description}</p>
      {/* Add other project details */}
      <div className="mt-4">
        <Link href={`/workspace/projects/${project.slug}/edit`}>
          <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 mr-2">
            Edit Project
          </button>
        </Link>
        <Link href={`/workspace/projects/${project.slug}/delete`}>
          <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
            Delete Project
          </button>
        </Link>
      </div>
    </div>
  );
};

export default ProjectPage;
