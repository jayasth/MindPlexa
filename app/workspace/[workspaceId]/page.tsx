import { createClient } from '@/utils/supabase/supabaseServer';
import { redirect } from 'next/navigation';
import WorkspaceOverview from './_components/WorkspaceOverview';
import WorkspaceToolbar from './_components/WorkspaceToolbar';
import { Tables } from '@/types_db';

type Workspace = Tables<'workspaces'>;

export default async function Workspace({
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
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.log(error);
    return <div>Error loading workspace</div>;
  }

  return (
    <div className="max-w-6xl px-4 py-8 mx-auto sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold">{workspace.name}</h1>
      <WorkspaceOverview workspace={workspace} />
      <WorkspaceToolbar workspace={workspace} />
    </div>
  );
}
