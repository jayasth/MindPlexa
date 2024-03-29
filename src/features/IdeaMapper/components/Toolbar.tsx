import React from "react";
import {
  FiPlus,
  FiRotateCcw,
  FiDownload,
  FiRotateCw,
  FiGrid,
  FiTrash2,
  FiEdit,
  FiLink,
  FiScissors,
} from "react-icons/fi";
import { Edge } from "reactflow";

interface ToolbarProps {
  onAddNode: (label: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onEditNode: (nodeId: string, label: string) => void;
  onAddEdge: (newEdge: Edge) => void;
  onDeleteEdge: (edgeId: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onExport: () => void;
  onAutoArrange: () => void;
  onSaveToVault: () => Promise<void>;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onAddNode,
  onDeleteNode,
  onEditNode,
  onAddEdge,
  onDeleteEdge,
  onUndo,
  onRedo,
  onExport,
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
      <button
        onClick={() => onDeleteNode("selected-node-id")}
        title="Delete Node"
      >
        <FiTrash2 />
      </button>
      <button
        onClick={() => onEditNode("selected-node-id", "Updated Label")}
        title="Edit Node"
      >
        <FiEdit />
      </button>
      <button
        onClick={() =>
          onAddEdge({
            id: "new-edge-id",
            source: "source-node-id",
            target: "target-node-id",
          })
        }
        title="Add Edge"
      >
        <FiLink />
      </button>
      <button
        onClick={() => onDeleteEdge("selected-edge-id")}
        title="Delete Edge"
      >
        <FiScissors />
      </button>
      <button onClick={onUndo} title="Undo">
        <FiRotateCcw />
      </button>
      <button onClick={onRedo} title="Redo">
        <FiRotateCw />
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
