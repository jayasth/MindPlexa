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

  return <WorkspaceLayoutClient>{children}</WorkspaceLayoutClient>;
}
