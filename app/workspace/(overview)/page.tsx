import React from 'react';
import Link from 'next/link';
import { FaThLarge, FaChartBar } from 'react-icons/fa';
import { createClient } from '@/utils/supabase/supabaseServer';
import CanvasList from '@/ui/canvas/CanvasList';

export default async function WorkspacePage() {
  const supabase = createClient();

  const { data: canvases, error: canvasesError } = await supabase
    .from('canvases')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(5);

  if (canvasesError) {
    console.error('Error fetching data:', canvasesError);
    return <div>Error loading workspace data</div>;
  }

  return (
    <main>
      <h1 className="text-3xl font-bold mb-6">Workspace Overview</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <FaThLarge className="mr-2" /> Recent Canvases
          </h2>
          <CanvasList canvases={canvases ?? []} />
          <Link
            href="/workspace/canvases"
            className="text-lavender-600 hover:underline mt-4 inline-block"
          >
            View all canvases
          </Link>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <FaChartBar className="mr-2" /> Workspace Analytics
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Track your progress and productivity across canvases.
          </p>
          <Link href="/workspace/analytics">
            <button className="px-4 py-2 bg-lavender-500 text-white rounded hover:bg-lavender-600">
              View Analytics
            </button>
          </Link>
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Link href="/canvasEditor/new">
            <button className="w-full px-4 py-2 bg-lavender-500 text-white rounded hover:bg-lavender-600">
              Create New Canvas
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
