import React from 'react';
import Link from 'next/link';

const WorkspacePage: React.FC = () => {
  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Workspace</h1>
      <div className="grid gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Create New Project</h2>
          <p className="text-gray-600 mb-4">
            Start a new project and collaborate with your team.
          </p>
          <Link href="/workspace/projects/new">
            <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
              Create New Project
            </button>
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Create New Canvas</h2>
          <p className="text-gray-600 mb-4">
            Create a new canvas to brainstorm and visualize your ideas.
          </p>
          <Link href="/canvas">
            <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
              Create New Canvas
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
};

export default WorkspacePage;
