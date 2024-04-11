import { createClient } from '@/utils/supabase/supabaseServer';
import { redirect } from 'next/navigation';
import ProjectDetails from './ProjectDetails';

export default async function ProjectPage({
  params
}: {
  params: { projectId: string };
}) {
  const supabase = createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/signin');
  }

  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', params.projectId)
    .single();

  if (error) {
    console.log(error);
    return <div>Error loading project</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <ProjectDetails project={project} />
    </div>
  );
}
