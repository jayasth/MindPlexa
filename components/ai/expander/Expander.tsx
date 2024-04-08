import React, { useState } from "react";
import axios from "axios";
import { FaRobot } from "react-icons/fa";

interface ExpanderProps {
  nodeId: string;
  nodeContent: string;
  onExpandNode: (nodeId: string, expandedContent: string) => void;
}

const Expander: React.FC<ExpanderProps> = ({
  nodeId,
  nodeContent,
  onExpandNode,
}) => {
  const [loading, setLoading] = useState(false);

  const handleExpandNode = async () => {
    setLoading(true);

    try {
      const response = await axios.post("/api/ai/expand", {
        nodeId,
        nodeContent,
      });
      const { expandedContent } = response.data;
      onExpandNode(nodeId, expandedContent);
    } catch (error) {
      console.error("Error expanding node:", error);
    }

    setLoading(false);
  };

  return (
    <div className="expander">
      <button onClick={handleExpandNode} disabled={loading}>
        <FaRobot className="expander-icon" />
        {loading ? "Expanding..." : "Expand Node"}
      </button>
    </div>
  );
};

export default Expander;
