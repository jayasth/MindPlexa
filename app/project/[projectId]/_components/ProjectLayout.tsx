// client/src/components/project/ProjectLayout.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser, useSupabaseClient } from '@/utils/auth-helpers-react';
import ProjectList from './ProjectList';

const ProjectLayout: React.FC = () => {
  const router = useRouter();
  const supabaseClient = useSupabaseClient();
  const user = useUser();
  const workspaceId = 'YOUR_WORKSPACE_ID'; // Replace with the actual workspace ID

  useEffect(() => {
    // If the user is not authenticated, redirect to the login page
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  return (
    <div>
      <h1>MindPlexa</h1>
      <ProjectList />
    </div>
  );
};

export default ProjectLayout;
