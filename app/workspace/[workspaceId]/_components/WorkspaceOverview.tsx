import { Workspaces } from '@/types/database/workspaces';

type Workspace = Workspaces['Row'];

interface WorkspaceOverviewProps {
  workspace: Workspace;
}

const WorkspaceOverview: React.FC<WorkspaceOverviewProps> = ({ workspace }) => {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">{workspace.name}</h1>
      <p className="text-gray-600 mb-8">{workspace.description}</p>
      {/* Add more workspace overview content */}
    </div>
  );
};

export default WorkspaceOverview;
