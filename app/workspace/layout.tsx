import { createClient } from '@/utils/supabase/supabaseServer';
import { redirect } from 'next/navigation';
import WorkspaceLayoutClient from './_components/WorkspaceLayoutClient';

export default async function Layout({
  children
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/signin');
  }

  const { data: workspaces } = await supabase
    .from('workspaces')
    .select('*')
    .or(`owner_id.eq.${user.id},workspace_members.user_id.eq.${user.id}`)
    .order('created_at', { ascending: false });

  return (
    <WorkspaceLayoutClient workspaces={workspaces || null}>
      {children}
    </WorkspaceLayoutClient>
  );
}
