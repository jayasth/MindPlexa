// src/components/IdeaMapper/Toolbar.tsx

import React from "react";
import {
  FiPlus,
  FiRotateCcw,
  FiDownload,
  FiRotateCw,
  FiGrid,
  FiTrash2,
  FiZoomIn,
  FiZoomOut,
} from "react-icons/fi";

interface ToolbarProps {
  onAddNode: (label: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onExport: () => void;
  onDelete: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onAutoArrange: () => void;
  onSaveToVault: () => Promise<void>;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onAddNode,
  onUndo,
  onRedo,
  onExport,
  onDelete,
  onZoomIn,
  onZoomOut,
  onAutoArrange,
}) => {
  const handleAddNode = () => {
    const label = prompt("Enter node label:");
    if (label) {
      onAddNode(label);
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <button onClick={handleAddNode} title="Add Node">
        <FiPlus />
      </button>
      <button onClick={onUndo} title="Undo">
        <FiRotateCcw />
      </button>
      <button onClick={onRedo} title="Redo">
        <FiRotateCw />
      </button>
      <button onClick={onDelete} title="Delete">
        <FiTrash2 />
      </button>
      <button onClick={onZoomIn} title="Zoom In">
        <FiZoomIn />
      </button>
      <button onClick={onZoomOut} title="Zoom Out">
        <FiZoomOut />
      </button>
      <button onClick={onAutoArrange} title="Auto Arrange">
        <FiGrid />
      </button>
      <button onClick={onExport} title="Export">
        <FiDownload />
      </button>
    </div>
  );
};

export default Toolbar;
