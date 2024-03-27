// src/components/IdeaMapper/CustomNode.tsx
import React, { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";

const CustomNode: React.FC<NodeProps> = ({ data }) => {
  return (
    <div
      className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200"
      style={{ borderTop: `4px solid ${data.color}` }}
    >
      <div className="flex items-center">
        <div
          className="w-3 h-3 rounded-full mr-2"
          style={{ backgroundColor: data.color }}
        />
        <div className="text-lg font-semibold">{data.label}</div>
      </div>
      <Handle
        type="target"
        position={Position.Top}
        className="w-4 h-4 bg-gray-300 rounded-full -top-2"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-4 h-4 bg-gray-300 rounded-full -bottom-2"
      />
    </div>
  );
};

export default memo(CustomNode);
