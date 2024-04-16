// C:/coding/MindPlexa/app/projects/page.tsx

import { createClient } from '@/utils/supabase/supabaseServer';
import { redirect } from 'next/navigation';
import ProjectList from './ProjectList';
import Link from 'next/link';

export default async function ProjectsPage() {
  const supabase = createClient();

  // Fetch user from Supabase auth
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  // Redirect if no user is found or there's an error fetching the user
  if (!user || userError) {
    return redirect('/signin');
  }

  // Fetch projects without any filtering by workspace_id
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('*');

  // Handle possible errors during projects fetching
  if (projectsError) {
    console.error('Error loading projects:', projectsError);
    return <div>Error loading projects</div>;
  }

  // Render the page with projects data
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Link
          href="/projects/new"
          className="px-4 py-2 font-bold text-dark-text bg-blue-500 rounded-md hover:bg-blue-600"
        >
          Create Project
        </Link>
      </div>
      <ProjectList projects={projects ?? []} />
    </div>
  );
}
