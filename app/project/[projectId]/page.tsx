import { createClient } from '@/utils/supabase/supabaseServer';
import { redirect } from 'next/navigation';
import ProjectDetails from './_components/ProjectDetails';
import ProjectToolbar from './_components/ProjectToolbar';
import { Tables } from '@/types_db';

type Project = Tables<'projects'>;

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
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.log(error);
    return <div>Error loading project</div>;
  }

  return (
    <div className="max-w-6xl px-4 py-8 mx-auto sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold">{project.name}</h1>
      <ProjectToolbar project={project} />
      <ProjectDetails project={project} />
    </div>
  );
}
