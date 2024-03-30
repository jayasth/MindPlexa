import React, { memo, useState, useCallback } from "react";
import { Handle, Position, NodeProps as BaseNodeProps } from "reactflow";
import { FiTrash2 } from "react-icons/fi";

interface NodeProps extends BaseNodeProps {
  onDelete: (id: string) => void;
}

const CustomNode: React.FC<NodeProps> = ({
  data,
  isConnectable,
  id,
  selected,
  onDelete,
  type,
}) => {
  const [label, setLabel] = useState(data.label || "");
  const [color, setColor] = useState(data.color || "#FF6B6B");
  const [fontSize, setFontSize] = useState(data.fontSize || 16);

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

  const handleFontSizeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFontSize(parseInt(e.target.value));
    },
    []
  );

  const handleDelete = useCallback(() => {
    onDelete(id);
  }, [id, onDelete]);

  if (type === "group") {
    return (
      <div
        className={`bg-white rounded-lg shadow-md p-4 ${
          selected ? "border-2 border-blue-500" : ""
        }`}
        style={{ backgroundColor: color }}
      >
        <input
          type="text"
          value={label}
          onChange={handleLabelChange}
          className="text-lg font-semibold border-none outline-none w-full mb-2"
          style={{ fontSize: `${fontSize}px` }}
        />
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-lg shadow-md p-4 ${
        selected ? "border-2 border-blue-500" : ""
      }`}
      style={{ backgroundColor: color }}
    >
      <input
        type="text"
        value={label}
        onChange={handleLabelChange}
        className="text-lg font-semibold border-none outline-none w-full mb-2"
        style={{ fontSize: `${fontSize}px` }}
      />
      <div className="flex items-center space-x-2">
        <input
          type="color"
          value={color}
          onChange={handleColorChange}
          className="w-8 h-8 border-none outline-none"
        />
        <input
          type="number"
          value={fontSize}
          onChange={handleFontSizeChange}
          className="w-16 border border-gray-300 rounded px-2 py-1"
        />
      </div>
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
