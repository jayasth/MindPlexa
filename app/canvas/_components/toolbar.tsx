import React from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';
import Button from '@/components/ui/Button';

interface ToolbarProps {
  onAddNode: () => void;
  onDeleteNode: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onAddNode, onDeleteNode }) => {
  return (
    <div className="bg-gray-900 p-4 flex flex-col space-y-4">
      <Button onClick={onAddNode} className="p-2">
        <FaPlus />
      </Button>
      <Button onClick={onDeleteNode} className="p-2">
        <FaTrash />
      </Button>
    </div>
  );
};

export default Toolbar;
