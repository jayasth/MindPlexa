import React from "react";
import Button from "../UI/Button";

interface ToolbarProps {
  onAddNode: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onAutoArrange: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onAddNode,
  onUndo,
  onRedo,
  onExport,
  onImport,
  onAutoArrange,
}) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImport(file);
    }
  };

  return (
    <div className="bg-white p-4">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-1">
        <Button onClick={onAddNode}>Add Node</Button>
        <Button onClick={onUndo}>Undo</Button>
        <Button onClick={onRedo}>Redo</Button>
        <Button onClick={onExport}>Export</Button>
        <label>
          Import
          <input type="file" accept=".json" onChange={handleFileChange} />
        </label>
        <Button onClick={onAutoArrange}>Auto Arrange</Button>
      </div>
      <p className="mt-4 text-sm">Keyboard Shortcuts:</p>
      <ul className="text-xs">
        <li>Ctrl+A: Add Node</li>
        <li>Delete: Remove Selected Node</li>
      </ul>
    </div>
  );
};

export default Toolbar;
