import React, { useEffect, useState } from "react";
import { supabase } from "../../../shared/utils/supabaseClient";

interface CollaboratorsListProps {
  mindmapId: number;
}

const CollaboratorsList: React.FC<CollaboratorsListProps> = ({ mindmapId }) => {
  const [collaborators, setCollaborators] = useState<any[]>([]);

  useEffect(() => {
    const fetchCollaborators = async () => {
      const { data, error } = await supabase
        .from("mindmap_shares")
        .select("user_id, access_level")
        .eq("mindmap_id", mindmapId);

      if (error) {
        console.error("Error fetching collaborators:", error);
      } else {
        setCollaborators(data);
      }
    };

    fetchCollaborators();
  }, [mindmapId]);

  return (
    <div>
      <h3 className="text-lg font-bold mb-2">Collaborators</h3>
      {collaborators.map((collaborator) => (
        <div key={collaborator.user_id} className="mb-2">
          <span>User ID: {collaborator.user_id}</span>
          <span className="ml-2">{collaborator.access_level}</span>
        </div>
      ))}
    </div>
  );
};

export default CollaboratorsList;
