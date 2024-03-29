// src/features/IdeaMapper/components/Toolbar.tsx
import React from "react";
import { FiSave, FiTrash2, FiDownload } from "react-icons/fi";

interface ToolbarProps {
  onSave: () => void;
  onDelete: () => void;
  onExport: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onSave, onDelete, onExport }) => {
  return (
    <div className="flex space-x-2">
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
    </div>
  );
};

export default Toolbar;
