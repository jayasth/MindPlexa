import { useState } from 'react';
import { createClient } from '@/utils/supabase/supabaseClient';
import type { Tables } from 'types_db';

type Workspace = Tables<'workspaces'>;

interface WorkspaceSettingsProps {
  workspace: Workspace;
}

const WorkspaceSettings: React.FC<WorkspaceSettingsProps> = ({ workspace }) => {
  const [name, setName] = useState(workspace.name);
  const [description, setDescription] = useState(workspace.description || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const supabase = createClient();

    const { error } = await supabase
      .from('workspaces')
      .update({ name, description })
      .eq('id', workspace.id);

    if (error) {
      console.log('Error updating workspace:', error);
    } else {
      console.log('Workspace updated successfully');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Workspace Settings</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block mb-2 font-bold">
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block mb-2 font-bold">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows={4}
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 font-bold text-dark-text bg-blue-500 rounded-md hover:bg-blue-600"
        >
          Save Settings
        </button>
      </form>
    </div>
  );
};

export default WorkspaceSettings;
