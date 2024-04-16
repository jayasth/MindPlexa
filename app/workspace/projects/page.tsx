// C:/coding/MindPlexa/app/projects/page.tsx

import { createClient } from '@/utils/supabase/supabaseServer';
import { redirect } from 'next/navigation';
import ProjectList from '@/ui/project/ProjectList';
import Link from 'next/link';
import { MdOutlineCreateNewFolder } from 'react-icons/md';

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
        <Link href="/workspace/projects/new" className="relative group">
          <MdOutlineCreateNewFolder size={24} className="text-myGray-500" />
          <span className="sr-only">Create Project</span>
          <div className="absolute right-4 bg-myGray-300 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            Create Project
          </div>
        </Link>
      </div>
      <ProjectList projects={projects ?? []} />
    </div>
  );
}
