// client/src/components/workspace/WorkspaceLayout.tsx
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import WorkspaceList from "./WorkspaceList";
import WorkspaceModal from "./WorkspaceModal";

const WorkspaceLayout: React.FC = () => {
  const router = useRouter();
  const supabaseClient = useSupabaseClient();
  const user = useUser();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // If the user is not authenticated, redirect to the login page
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  const handleCreateWorkspace = async (name: string, description: string) => {
    try {
      const { data, error } = await supabaseClient
        .from("workspaces")
        .insert({ name, description, owner_id: user?.id })
        .single();

      if (error) {
        console.error("Error creating workspace:", error);
      } else {
        setShowModal(false);
        // Optionally, you can redirect to the newly created workspace
        // router.push(`/workspace/${data.id}`);
      }
    } catch (error) {
      console.error("Error creating workspace:", error);
    }
  };

  return (
    <div>
      <h1>MindPlexa</h1>
      <WorkspaceList />
      <button onClick={() => setShowModal(true)}>Create Workspace</button>
      {showModal && (
        <WorkspaceModal
          onSubmit={handleCreateWorkspace}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default WorkspaceLayout;
