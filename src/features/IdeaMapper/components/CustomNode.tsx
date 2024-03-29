// src/features/IdeaMapper/components/CustomNode.tsx
import React, { memo, useState, useCallback } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { FiTrash2 } from "react-icons/fi";

interface CustomNodeProps extends NodeProps {
  onDelete: (nodeId: string) => void;
}

const CustomNode: React.FC<CustomNodeProps> = ({
  data,
  isConnectable,
  id,
  selected,
  onDelete,
}) => {
  const [label, setLabel] = useState(data.label || "");
  const [color, setColor] = useState(data.color || "#FF6B6B");

  const handleLabelChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setLabel(e.target.value);
    },
    []
  );

  const handleColorChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setColor(e.target.value);
    },
    []
  );

  const handleDelete = useCallback(() => {
    onDelete(id);
  }, [id, onDelete]);

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <input
        type="text"
        value={label}
        onChange={handleLabelChange}
        className="text-lg font-semibold border-none outline-none w-full mb-2"
      />
      <input
        type="color"
        value={color}
        onChange={handleColorChange}
        className="w-full h-8 border-none outline-none"
      />
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
      />
      <button
        onClick={handleDelete}
        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
      >
        <FiTrash2 />
      </button>
    </div>
  );
};

export default memo(CustomNode);
