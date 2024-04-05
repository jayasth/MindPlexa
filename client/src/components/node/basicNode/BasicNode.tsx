import React from "react";
import { Handle, Position } from "reactflow";
import { FaCircle } from "react-icons/fa";

interface BasicNodeProps {
  data: {
    label: string;
    description: string;
  };
}

const BasicNode: React.FC<BasicNodeProps> = ({ data }) => {
  return (
    <div className="basic-node">
      <div className="basic-node-header">
        <FaCircle className="basic-icon" />
        <span>{data.label}</span>
      </div>
      <div className="basic-node-content">{data.description}</div>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default BasicNode;
