'use client';

import { Tables } from '@/types_db';

type Workspace = Tables<'workspaces'>;

interface WorkspaceOverviewProps {
  workspace: Workspace;
}

export default function WorkspaceOverview({
  workspace
}: WorkspaceOverviewProps) {
  // Placeholder implementation for the customizable overview
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold">Overview</h2>
      <p>Customizable overview for workspace: {workspace.name}</p>
      {/* Add your customizable overview implementation here */}
    </div>
  );
}
