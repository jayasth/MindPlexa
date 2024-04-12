import { createClient } from '@/utils/supabase/supabaseServer';
import { redirect } from 'next/navigation';
import WorkspaceOverview from '@/app/workspace/_components/WorkspaceOverview';
import WorkspaceSettings from '@/app/workspace/_components/WorkspaceSettings';
import ProjectLibrary from '../_components/ProjectLibrary.1';

export default async function WorkspacePage({
  params
}: {
  params: { workspaceId: string };
}) {
  const supabase = createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/signin');
  }

  const { data: workspace, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', params.workspaceId)
    .single();

  if (error) {
    console.log(error);
    return <div>Error loading workspace</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <WorkspaceOverview workspace={workspace} />
      <WorkspaceSettings workspace={workspace} />
      <ProjectLibrary workspaceId={params.workspaceId} />
    </div>
  );
}
