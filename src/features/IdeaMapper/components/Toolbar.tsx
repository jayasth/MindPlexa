// src/features/IdeaMapper/components/Toolbar.tsx
import React from "react";
import { FiSave, FiTrash2, FiDownload, FiShare2, FiPlus } from "react-icons/fi";

interface ToolbarProps {
  onSelectMapperType: (type: string) => void;
  onAddNode: () => void;
  onSave: () => void;
  onDelete: () => void;
  onExport: () => void;
  onExportJSON: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onSelectMapperType,
  onAddNode,
  onSave,
  onDelete,
  onExport,
  onExportJSON,
}) => {
  return (
    <div className="flex flex-col space-y-2">
      <select
        onChange={(e) => onSelectMapperType(e.target.value)}
        className="border border-gray-300 rounded px-2 py-1"
      >
        <option value="tree">Tree Mind Map</option>
        <option value="flow">Flow Chart</option>
        <option value="canvas">Visual Canvas</option>
      </select>
      <button
        onClick={onAddNode}
        className="text-green-500 hover:text-green-700"
        title="Add Node"
      >
        <FiPlus size={20} />
      </button>
      <button
        onClick={onSave}
        className="text-blue-500 hover:text-blue-700"
        title="Save"
      >
        <FiSave size={20} />
      </button>
      <button
        onClick={onDelete}
        className="text-red-500 hover:text-red-700"
        title="Delete"
      >
        <FiTrash2 size={20} />
      </button>
      <button
        onClick={onExport}
        className="text-green-500 hover:text-green-700"
        title="Export"
      >
        <FiDownload size={20} />
      </button>
      <button
        onClick={onExportJSON}
        className="text-purple-500 hover:text-purple-700"
        title="Export JSON"
      >
        <FiShare2 size={20} />
      </button>
    </div>
  );
};

export default Toolbar;
