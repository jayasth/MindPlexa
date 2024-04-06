import React, { useState } from "react";
import axios from "axios";
import { FaRobot } from "react-icons/fa";
import { Node } from "reactflow";

interface ConnectorProps {
  nodes: Node[];
  onConnectNodes: (sourceNodeId: string, targetNodeId: string) => void;
}

const Connector: React.FC<ConnectorProps> = ({ nodes, onConnectNodes }) => {
  const [loading, setLoading] = useState(false);

  const handleConnectNodes = async () => {
    setLoading(true);

    try {
      const response = await axios.post("/api/ai/connect", { nodes });
      const { sourceNodeId, targetNodeId } = response.data;
      onConnectNodes(sourceNodeId, targetNodeId);
    } catch (error) {
      console.error("Error connecting nodes:", error);
    }

    setLoading(false);
  };

  return (
    <div className="connector">
      <h3>
        <FaRobot className="connector-icon" /> AI Node Connector
      </h3>
      <button onClick={handleConnectNodes} disabled={loading}>
        {loading ? "Connecting..." : "Connect Nodes"}
      </button>
    </div>
  );
};

export default Connector;
