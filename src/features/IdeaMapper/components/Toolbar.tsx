// src/features/IdeaMapper/components/Toolbar.tsx
import React from "react";
import { FiPlus, FiTrash2, FiSave, FiDownload, FiShare2 } from "react-icons/fi";

interface ToolbarProps {
  onAddNode: () => void;
  onDeleteNode: () => void;
  onSelectNode: (nodeId: string) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onAddNode,
  onDeleteNode,
  onSelectNode,
}) => {
  return (
    <div className="flex flex-col space-y-2">
      <button
        onClick={onAddNode}
        className="text-green-500 hover:text-green-700"
        title="Add Node"
      >
        <FiPlus size={20} />
      </button>
      <button
        onClick={onDeleteNode}
        className="text-red-500 hover:text-red-700"
        title="Delete Node"
      >
        <FiTrash2 size={20} />
      </button>
      <button className="text-blue-500 hover:text-blue-700" title="Save">
        <FiSave size={20} />
      </button>
      <button className="text-purple-500 hover:text-purple-700" title="Export">
        <FiDownload size={20} />
      </button>
      <button
        className="text-orange-500 hover:text-orange-700"
        title="Export to JSON"
      >
        <FiShare2 size={20} />
      </button>
    </div>
  );
};

export default Toolbar;
