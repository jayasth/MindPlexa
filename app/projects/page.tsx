import { createClient } from '@/utils/supabase/supabaseServer';
import { redirect } from 'next/navigation';
import ProjectList from './ProjectList';
import Link from 'next/link';

export default async function ProjectsPage() {
  const supabase = createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/signin');
  }

  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .eq('workspace_id', user.id);

  if (error) {
    console.log(error);
    return <div>Error loading projects</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Link href="/projects/new">
          <button className="px-4 py-2 font-bold text-white bg-blue-500 rounded-md hover:bg-blue-600">
            Create Project
          </button>
        </Link>
      </div>
      <ProjectList projects={projects ?? []} />
    </div>
  );
}
