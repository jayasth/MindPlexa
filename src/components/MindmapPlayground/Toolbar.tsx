import React from "react";
import Button from "../UI/Button";

interface ToolbarProps {
  onAddNode: () => void;
  onUndo: () => void;
  onRedo: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onAddNode, onUndo, onRedo }) => {
  return (
    <div className="bg-white p-4">
      <Button onClick={onAddNode}>Add Node</Button>
      <Button onClick={onUndo}>Undo</Button>
      <Button onClick={onRedo}>Redo</Button>
      <p className="mt-4 text-sm">Keyboard Shortcuts:</p>
      <ul className="text-xs">
        <li>Ctrl+A: Add Node</li>
        <li>Delete: Remove Selected Node</li>
      </ul>
    </div>
  );
};

export default Toolbar;
