import React, { useState } from "react";
import axios from "axios";
import { FaRobot } from "react-icons/fa";
import { Node } from "reactflow";

interface OrganizerProps {
  nodes: Node[];
  onOrganizeNodes: (organizedNodes: Node[]) => void;
}

const Organizer: React.FC<OrganizerProps> = ({ nodes, onOrganizeNodes }) => {
  const [loading, setLoading] = useState(false);

  const handleOrganizeNodes = async () => {
    setLoading(true);

    try {
      const response = await axios.post("/api/ai/organize", { nodes });
      const { organizedNodes } = response.data;
      onOrganizeNodes(organizedNodes);
    } catch (error) {
      console.error("Error organizing nodes:", error);
    }

    setLoading(false);
  };

  return (
    <div className="organizer">
      <h3>
        <FaRobot className="organizer-icon" /> AI Node Organizer
      </h3>
      <button onClick={handleOrganizeNodes} disabled={loading}>
        {loading ? "Organizing..." : "Organize Nodes"}
      </button>
    </div>
  );
};

export default Organizer;
