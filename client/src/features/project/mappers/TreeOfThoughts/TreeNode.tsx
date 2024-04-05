import React from "react";
import { Handle, Position, NodeProps } from "reactflow";

const TreeNode: React.FC<NodeProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="text-lg font-semibold">{data.label}</div>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default TreeNode;
