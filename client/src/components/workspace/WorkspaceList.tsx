// client/src/components/workspace/WorkspaceList.tsx
import React, { useState, useEffect } from "react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";

interface Workspace {
  id: string;
  name: string;
  description: string;
}

const WorkspaceList: React.FC = () => {
  const supabaseClient = useSupabaseClient();
  const user = useUser();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);

  useEffect(() => {
    fetchWorkspaces();
  }, [user]);

  const fetchWorkspaces = async () => {
    try {
      const { data, error } = await supabaseClient
        .from("workspaces")
        .select("*")
        .eq("owner_id", user?.id);

      if (error) {
        console.error("Error fetching workspaces:", error);
      } else {
        setWorkspaces(data as Workspace[]);
      }
    } catch (error) {
      console.error("Error fetching workspaces:", error);
    }
  };

  return (
    <div className="workspace-list">
      <h2>Workspaces</h2>
      <ul>
        {workspaces.map((workspace) => (
          <li key={workspace.id}>
            <h3>{workspace.name}</h3>
            <p>{workspace.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WorkspaceList;
