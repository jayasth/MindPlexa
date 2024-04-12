import { Workspaces } from '@/types/database/workspaces';
import Link from 'next/link';

type Workspace = Workspaces['Row'];

interface WorkspaceListProps {
  workspaces: Workspace[];
}

const WorkspaceList: React.FC<WorkspaceListProps> = ({ workspaces }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {workspaces.map((workspace) => (
        <div key={workspace.id} className="bg-white shadow-md rounded-lg p-6">
          <Link href={`/workspace/${workspace.id}`}>
            <h2 className="text-xl font-semibold mb-4">{workspace.name}</h2>
          </Link>
          <p className="text-gray-600">{workspace.description}</p>
        </div>
      ))}
    </div>
  );
};

export default WorkspaceList;
