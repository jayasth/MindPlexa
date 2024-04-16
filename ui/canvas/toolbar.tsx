import React from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';

interface ToolbarProps {
  onAddNode: () => void;
  onDeleteNode: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onAddNode, onDeleteNode }) => {
  return (
    <div className="flex flex-col space-y-4">
      <button onClick={onAddNode} className="p-2 bg-myGray-700 rounded">
        <FaPlus />
      </button>
      <button onClick={onDeleteNode} className="p-2 bg-myGray-700 rounded">
        <FaTrash />
      </button>
    </div>
  );
};

export default Toolbar;
