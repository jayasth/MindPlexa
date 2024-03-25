// src/components/IdeaMapperPlayground/NodeStyles.tsx

import React, { memo, FC, CSSProperties, useState } from "react";
import { Handle, Position, NodeProps } from "reactflow";

const nodeStyle: CSSProperties = {
  padding: "10px",
  borderRadius: "5px",
  background: "#fff",
  border: "1px solid #1a192b",
  width: "150px",
  fontSize: "12px",
  color: "#222",
  textAlign: "center",
};

interface NodeData {
  label: string;
}

const CustomNode: FC<NodeProps<NodeData>> = ({ id, data }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label);

  const handleLabelClick = () => {
    setIsEditing(true);
  };

  const handleLabelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLabel(event.target.value);
  };

  const handleLabelBlur = () => {
    setIsEditing(false);
  };

  return (
    <div style={nodeStyle}>
      <Handle type="target" position={Position.Top} />
      {isEditing ? (
        <input
          type="text"
          value={label}
          onChange={handleLabelChange}
          onBlur={handleLabelBlur}
          autoFocus
        />
      ) : (
        <div onClick={handleLabelClick}>{label}</div>
      )}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default memo(CustomNode);
