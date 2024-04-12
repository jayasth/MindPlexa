'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/supabaseClient';
import DashboardContent from './DashboardContent';
import { Workspaces } from '@/types/database/workspaces';
import { Projects } from '@/types/database/projects';
import { Profiles } from '@/types/database/profiles';

type Workspace = Workspaces['Row'];
type Project = Projects['Row'];
type Profile = Profiles['Row'];

export default function Dashboard() {
  const supabase = createClient();
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // Get the current user session from Supabase
      const sessionData = await supabase.auth.getSession();

      if (!sessionData.data.session) {
        router.push('/signin/password_signin');
        return; // Return here to prevent further execution if no user
      }

      const { user } = sessionData.data.session;

      if (!user) {
        console.error('No user data found in session');
        router.push('/signin/password_signin');
        return;
      }

      const { data: workspacesData, error: workspacesError } = await supabase
        .from('workspaces')
        .select('*')
        .eq('owner_id', user.id);

      if (workspacesError) {
        console.error('Error fetching workspaces:', workspacesError);
      }

      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*');

      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      }

      setWorkspaces(workspacesData ?? []);
      setProjects(projectsData ?? []);
      setProfile(profileData || null);
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
