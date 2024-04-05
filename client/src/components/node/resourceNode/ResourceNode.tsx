import React from "react";
import { Handle, Position } from "reactflow";
import { FaFile } from "react-icons/fa";

interface ResourceNodeProps {
  data: {
    label: string;
    description: string;
  };
}

const ResourceNode: React.FC<ResourceNodeProps> = ({ data }) => {
  return (
    <div className="resource-node">
      <div className="resource-node-header">
        <FaFile className="resource-icon" />
        <span>{data.label}</span>
      </div>
      <div className="resource-node-content">{data.description}</div>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default ResourceNode;
