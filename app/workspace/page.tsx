import { createClient } from '@/utils/supabase/supabaseServer';
import { redirect } from 'next/navigation';
import WorkspaceList from '@/app/workspace/_components/WorkspaceList';

export default async function WorkspacesPage() {
  const supabase = createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/signin');
  }

  const { data: workspaces, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('owner_id', user.id);

  if (error) {
    console.log(error);
    return <div>Error loading workspaces</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">Default Workspace</h1>
      <WorkspaceList workspaces={workspaces ?? []} />
    </div>
  );
}
