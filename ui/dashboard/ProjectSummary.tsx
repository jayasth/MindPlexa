import React from 'react';
import Link from 'next/link';

export default function ProjectSummary() {
  // Fetch project data here or pass it as props
  const projects = [
    { id: 1, name: 'Project A', progress: 75 },
    { id: 2, name: 'Project B', progress: 30 },
    { id: 3, name: 'Project C', progress: 50 }
  ];

  return (
    <div className="bg-white shadow-sm p-4 rounded-lg">
      <h2 className="font-semibold text-lg mb-4">Current Projects</h2>
      <ul className="space-y-2">
        {projects.map((project) => (
          <li key={project.id} className="flex justify-between items-center">
            <Link
              href={`/workspace/projects/${project.id}`}
              className="text-blue-600 hover:underline"
            >
              {project.name}
            </Link>
            <div className="w-24 bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${project.progress}%` }}
              ></div>
            </div>
          </li>
        ))}
      </ul>
      <Link
        href="/workspace/projects"
        className="mt-4 inline-block text-blue-600 hover:underline"
      >
        View all projects
      </Link>
    </div>
  );
}
