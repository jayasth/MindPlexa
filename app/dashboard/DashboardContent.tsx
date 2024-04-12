import React from 'react';
import { FaFolder, FaUser, FaCog } from 'react-icons/fa';
import { Workspaces } from '@/types/database/workspaces';
import { Projects } from '@/types/database/projects';
import { Profiles } from '@/types/database/profiles';

type Workspace = Workspaces['Row'];
type Project = Projects['Row'];
type Profile = Profiles['Row'];

interface DashboardContentProps {
  workspaces: Workspace[] | null;
  projects: Project[] | null;
  profile: Profile | null;
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  workspaces,
  projects,
  profile
}) => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 shadow rounded">
          <div className="flex items-center mb-2">
            <FaFolder className="text-xl mr-2" />
            <h2 className="text-xl font-bold">Workspaces</h2>
          </div>
          <ul>
            {workspaces?.map((workspace) => (
              <li key={workspace.id} className="mb-2">
                <a href={`/workspace/${workspace.id}`}>{workspace.name}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-4 shadow rounded">
          <div className="flex items-center mb-2">
            <FaFolder className="text-xl mr-2" />
            <h2 className="text-xl font-bold">Projects</h2>
          </div>
          <ul>
            {projects?.map((project) => (
              <li key={project.id} className="mb-2">
                <a href={`/project/${project.id}`}>{project.name}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-4 shadow rounded">
          <div className="flex items-center mb-2">
            <FaUser className="text-xl mr-2" />
            <h2 className="text-xl font-bold">Profile</h2>
          </div>
          <p>Name: {profile?.full_name}</p>
          <p>Email: {profile?.avatar_url}</p>
          {/* Add more profile information */}
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center mb-2">
          <FaCog className="text-xl mr-2" />
          <h2 className="text-xl font-bold">Settings</h2>
        </div>
        {/* Add settings options */}
      </div>
    </div>
  );
};

export default DashboardContent;
