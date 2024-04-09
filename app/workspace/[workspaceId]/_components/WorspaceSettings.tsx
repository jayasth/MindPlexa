'use client';

import { Tables } from '@/types_db';

type Workspace = Tables<'workspaces'>;

interface SettingsProps {
  workspace: Workspace;
}

export default function Settings({ workspace }: SettingsProps) {
  return (
    <div className="mt-4">
      <h3 className="text-xl font-semibold">Settings</h3>
      {/* Add settings implementation */}
      <p>Customize settings for workspace: {workspace.name}</p>
    </div>
  );
}
