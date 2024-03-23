import React, { memo, FC, CSSProperties, useState, KeyboardEvent } from "react";
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
  link?: string;
}

interface CustomNodeProps extends NodeProps<NodeData> {
  onLabelChange: (nodeId: string, newLabel: string) => void;
}

const CustomNode: FC<CustomNodeProps> = ({ id, data, onLabelChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label);

  const handleLabelDoubleClick = () => {
    setIsEditing(true);
  };

  const handleLabelKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      setIsEditing(false);
      onLabelChange(id, label); // Use the callback to handle label changes
    }
  };

  return (
    <div style={nodeStyle}>
      <Handle type="target" position={Position.Top} />
      {isEditing ? (
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={handleLabelKeyDown}
          autoFocus
        />
      ) : (
        <div onDoubleClick={handleLabelDoubleClick}>{label}</div>
      )}
      {data.link && (
        <a href={data.link} target="_blank" rel="noopener noreferrer">
          Link
        </a>
      )}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default memo(CustomNode);
