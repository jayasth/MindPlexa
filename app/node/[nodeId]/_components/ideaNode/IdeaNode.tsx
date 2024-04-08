import React from "react";
import { Handle, Position } from "reactflow";
import { FaLightbulb } from "react-icons/fa";

interface IdeaNodeProps {
  data: {
    label: string;
    description: string;
  };
}

const IdeaNode: React.FC<IdeaNodeProps> = ({ data }) => {
  return (
    <div className="idea-node">
      <div className="idea-node-header">
        <FaLightbulb className="idea-icon" />
        <span>{data.label}</span>
      </div>
      <div className="idea-node-content">{data.description}</div>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default IdeaNode;
