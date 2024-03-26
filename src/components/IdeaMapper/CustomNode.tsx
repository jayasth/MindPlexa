// src/components/IdeaMapper/CustomNode.tsx

import React, { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";

const CustomNode: React.FC<NodeProps> = ({ data }) => {
  return (
    <div
      style={{
        backgroundColor: data.backgroundColor,
        padding: "10px",
        borderRadius: "5px",
        fontSize: "12px",
        color: "#222",
        textAlign: "center",
      }}
    >
      <Handle type="target" position={Position.Top} />
      <div>{data.label}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default memo(CustomNode);
