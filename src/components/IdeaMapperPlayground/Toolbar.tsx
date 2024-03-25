import React from "react";
import {
  FiPlus,
  FiRotateCcw,
  FiDownload,
  FiRotateCw,
  FiGrid,
} from "react-icons/fi";

interface ToolbarProps {
  onAddNode: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onExport: () => void;
  onImport: () => void;
  onAutoArrange: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onAddNode,
  onUndo,
  onRedo,
  onExport,
  onAutoArrange,
}) => {
  return (
    <div className="flex space-x-2">
      <button onClick={onAddNode} title="Add Node">
        <FiPlus />
      </button>
      <button onClick={onUndo} title="Undo">
        <FiRotateCcw />
      </button>
      <button onClick={onRedo} title="Redo">
        <FiRotateCw />
      </button>
      <button onClick={onExport} title="Export">
        <FiDownload />
      </button>
      <button onClick={onAutoArrange} title="Auto Arrange">
        <FiGrid />
      </button>
    </div>
  );
};

export default Toolbar;
