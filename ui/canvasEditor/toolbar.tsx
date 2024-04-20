import React from 'react';
import {
  FaTasks,
  FaUndo,
  FaRedo,
  FaShare,
  FaDownload,
  FaRegAddressBook,
  FaCode,
  FaPaintBrush,
  FaAngleDoubleRight
} from 'react-icons/fa';
import { PiNotepad } from 'react-icons/pi';
import Link from 'next/link';

interface ToolbarProps {
  onAddNode: (nodeType: 'note' | 'task' | 'custom' | 'code' | 'draw') => void;
  onUndo: () => void;
  onRedo: () => void;
  onShare: () => void;
  onDownload: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onAddNode,
  onUndo,
  onRedo,
  onShare,
  onDownload
}) => {
  // Base button class
  const buttonClass = 'buttonClass';

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex space-x-2">
        <Link
          href="/workspace/canvases"
          className={buttonClass}
          title="View List"
        >
          <FaAngleDoubleRight size="16" />
        </Link>
      </div>

      <button
        onClick={() => onAddNode('note')}
        className={buttonClass}
        title="Add Note Node"
      >
        <PiNotepad size="16" />
      </button>
      <button
        onClick={() => onAddNode('task')}
        className={buttonClass}
        title="Add Task Node"
      >
        <FaTasks size="16" />
      </button>
      <button
        onClick={() => onAddNode('custom')}
        className={buttonClass}
        title="Add Custom Node"
      >
        <FaRegAddressBook size="16" />
      </button>
      <button
        onClick={() => onAddNode('code')}
        className={buttonClass}
        title="Add Code Node"
      >
        <FaCode size="16" />
      </button>
      <button
        onClick={() => onAddNode('draw')}
        className={buttonClass}
        title="Add Draw Node"
      >
        <FaPaintBrush size="16" />
      </button>

      <button onClick={onUndo} className={buttonClass} title="Undo">
        <FaUndo size="16" />
      </button>
      <button onClick={onRedo} className={buttonClass} title="Redo">
        <FaRedo size="16" />
      </button>

      <button onClick={onShare} className={buttonClass} title="Share">
        <FaShare size="16" />
      </button>
      <button onClick={onDownload} className={buttonClass} title="Download">
        <FaDownload size="16" />
      </button>
    </div>
  );
};

export default Toolbar;
