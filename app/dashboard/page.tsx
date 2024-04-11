'use client';

import { createClient } from '@/utils/supabase/supabaseClient';
import { redirect } from 'next/navigation';
import DashboardContent from './DashboardContent';
import { useEffect, useState } from 'react';
import { Tables } from '@/types_db';

type Workspace = Tables<'workspaces'>;
type Project = Tables<'projects'>;
type Profile = Tables<'profiles'>;

export default function Dashboard() {
  const supabase = createClient();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        redirect('/signin/password_signin');
      }

      const { data: workspacesData } = await supabase
        .from('workspaces')
        .select('*')
        .eq('owner_id', user.id);

      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .eq('workspace_id', user.id);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setWorkspaces((workspacesData as Workspace[]) ?? []);
      setProjects((projectsData as Project[]) ?? []);
      setProfile(profileData as Profile | null);
    };

    fetchData();
  }, []);

  return (
    <div className="ml-16 md:ml-60 p-4">
      <DashboardContent
        workspaces={workspaces}
        projects={projects}
        profile={profile}
      />
    </div>
  );
}
