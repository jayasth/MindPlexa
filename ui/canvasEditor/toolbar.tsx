// File: ui/canvasEditor/toolbar.tsx

import React from 'react';
import { FaPlus, FaTasks, FaThList } from 'react-icons/fa';
import { PiNotepad } from 'react-icons/pi';
import { MdFormatListBulletedAdd } from 'react-icons/md';
import Link from 'next/link';

interface ToolbarProps {
  onAddNode: (nodeType: 'note' | 'task' | 'custom') => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onAddNode }) => {
  const handleAddNode = (nodeType: 'note' | 'task' | 'custom') => {
    onAddNode(nodeType);
  };

  // Base button class
  const buttonClass =
    'p-1 text-myGray-50 bg-myGray-500 rounded hover:bg-myGray-700';

  return (
    <div className="flex flex-col space-y-2">
      <button
        onClick={() => handleAddNode('note')}
        className={buttonClass}
        title="Add Note"
      >
        <PiNotepad size="16" />
      </button>
      <button
        onClick={() => handleAddNode('task')}
        className={buttonClass}
        title="Add Task"
      >
        <FaTasks size="16" />
      </button>
      <button
        onClick={() => handleAddNode('custom')}
        className={buttonClass}
        title="Add Custom Node"
      >
        <MdFormatListBulletedAdd size="16" />
      </button>
      <Link
        href="/workspace/canvases"
        className={buttonClass}
        title="View List"
      >
        <FaThList size="16" />
      </Link>
    </div>
  );
};

export default Toolbar;
