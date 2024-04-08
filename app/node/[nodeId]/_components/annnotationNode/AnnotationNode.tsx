import React from "react";
import { Handle, Position } from "reactflow";
import { FaComment } from "react-icons/fa";

interface AnnotationNodeProps {
  data: {
    label: string;
    description: string;
  };
}

const AnnotationNode: React.FC<AnnotationNodeProps> = ({ data }) => {
  return (
    <div className="annotation-node">
      <div className="annotation-node-header">
        <FaComment className="annotation-icon" />
        <span>{data.label}</span>
      </div>
      <div className="annotation-node-content">{data.description}</div>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default AnnotationNode;
