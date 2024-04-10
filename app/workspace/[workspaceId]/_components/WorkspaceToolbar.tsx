'use client';

import { Tables } from '@/types_db';
import Settings from './WorspaceSettings';
import UserProfile from './UserProfile';
import ProjectList from './ProjectList';
import NodeLibrary from './NodeLibrary';
import Insights from './Insights';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/supabaseClient';

type Workspace = Tables<'workspaces'>;
type User = Tables<'users'>;
type Project = Tables<'projects'>;
type Node = Tables<'nodes'>;
type Insight = Tables<'insights'>;

interface WorkspaceToolbarProps {
  workspace: Workspace;
}

export default function WorkspaceToolbar({ workspace }: WorkspaceToolbarProps) {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', workspace.owner_id) // Changed from workspace.user_id to workspace.owner_id
        .single();

      setUser(userData);

      const { data: projectData } = await supabase
        .from('projects')
        .select('*')
        .eq('workspace_id', workspace.id);

      setProjects(projectData || []);

      const { data: nodeData } = await supabase
        .from('nodes')
        .select('*')
        .eq('project_id', workspace.id); // Ensure this is supposed to reference projects

      setNodes(nodeData || []);

      const { data: insightData } = await supabase
        .from('insights')
        .select('*')
        .eq('workspace_id', workspace.id);

      setInsights(insightData || []);
    };

    fetchData();
  }, [workspace.id, workspace.owner_id]); // Changed workspace.user_id to workspace.owner_id

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold">Toolbar</h2>
      <Settings workspace={workspace} />
      {user && <UserProfile user={user} />}
      <ProjectList projects={projects} />
      <NodeLibrary nodes={nodes} />
      <Insights insights={insights} />
    </div>
  );
}
