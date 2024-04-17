// File: ui/canvasEditor/toolbar.tsx

import React from 'react';
import { FaPlus, FaTrash, FaThList } from 'react-icons/fa';
import Link from 'next/link';

interface ToolbarProps {
  onAddNode: () => void;
  onDeleteNode: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onAddNode, onDeleteNode }) => {
  // Base button class
  const buttonClass =
    'p-1 text-myGray-50 bg-myGray-500 rounded hover:bg-myGray-700';

  return (
    <div className="flex flex-col space-y-2">
      <button onClick={onAddNode} className={buttonClass} title="Add Node">
        <FaPlus size="10" />
      </button>
      <button
        onClick={onDeleteNode}
        className={buttonClass}
        title="Delete Node"
      >
        <FaTrash size="10" />
      </button>
      <Link
        href="/workspace/canvases"
        className={buttonClass}
        title="View List"
      >
        <FaThList size="10" />
      </Link>
    </div>
  );
};

export default Toolbar;
