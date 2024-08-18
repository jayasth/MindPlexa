import React from 'react';
import Link from 'next/link';
import { FaFolder, FaThLarge, FaChartBar } from 'react-icons/fa';
import { createClient } from '@/utils/supabase/supabaseServer';
import ProjectList from '@/ui/project/ProjectList';
import CanvasList from '@/ui/canvas/CanvasList';

export default async function WorkspacePage() {
  const supabase = createClient();

  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('*')
    .limit(3);

  const { data: canvases, error: canvasesError } = await supabase
    .from('canvases')
    .select('*')
    .limit(3);

  if (projectsError || canvasesError) {
    console.error('Error fetching data:', projectsError || canvasesError);
    return <div>Error loading workspace data</div>;
  }

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-6">Workspace Overview</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <FaFolder className="mr-2" /> Recent Projects
          </h2>
          <ProjectList projects={projects ?? []} />
          <Link
            href="/workspace/projects"
            className="text-blue-500 hover:underline mt-4 inline-block"
          >
            View all projects
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <FaThLarge className="mr-2" /> Recent Canvases
          </h2>
          <CanvasList canvases={canvases ?? []} />
          <Link
            href="/workspace/canvases"
            className="text-blue-500 hover:underline mt-4 inline-block"
          >
            View all canvases
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <FaChartBar className="mr-2" /> Workspace Analytics
          </h2>
          <p className="text-gray-600 mb-4">
            Track your progress and productivity across projects and canvases.
          </p>
          <Link href="/workspace/analytics">
            <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              View Analytics
            </button>
          </Link>
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/workspace/projects/new">
            <button className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
              Create New Project
            </button>
          </Link>
          <Link href="/canvasEditor/new">
            <button className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">
              Create New Canvas
            </button>
          </Link>
          <Link href="/workspace/invite">
            <button className="w-full px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">
              Invite Team Member
            </button>
          </Link>
          <Link href="/workspace/settings">
            <button className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
              Workspace Settings
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}
