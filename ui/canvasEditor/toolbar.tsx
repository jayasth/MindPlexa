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
import { createNode } from '@/ui/canvasEditor/utils/nodeCreation';
import { Node } from 'reactflow';
import { Dispatch, SetStateAction } from 'react';

interface ToolbarProps {
  onUndo: () => void;
  onRedo: () => void;
  onShare: () => void;
  onDownload: () => void;
  setNodes: Dispatch<SetStateAction<Node<any>[]>>;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onUndo,
  onRedo,
  onShare,
  onDownload,
  setNodes
}) => {
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
        onClick={() =>
          createNode('note', { x: 0, y: 0 }, (newNode) =>
            setNodes((prevNodes) => [...prevNodes, newNode])
          )
        }
        className={buttonClass}
        title="Add Note Node"
      >
        <PiNotepad size="16" />
      </button>
      <button
        onClick={() =>
          createNode('task', { x: 0, y: 0 }, (newNode) =>
            setNodes((prevNodes) => [...prevNodes, newNode])
          )
        }
        className={buttonClass}
        title="Add Task Node"
      >
        <FaTasks size="16" />
      </button>
      <button
        onClick={() =>
          createNode('custom', { x: 0, y: 0 }, (newNode) =>
            setNodes((prevNodes) => [...prevNodes, newNode])
          )
        }
        className={buttonClass}
        title="Add Custom Node"
      >
        <FaRegAddressBook size="16" />
      </button>
      <button
        onClick={() =>
          createNode('code', { x: 0, y: 0 }, (newNode) =>
            setNodes((prevNodes) => [...prevNodes, newNode])
          )
        }
        className={buttonClass}
        title="Add Code Node"
      >
        <FaCode size="16" />
      </button>
      <button
        onClick={() =>
          createNode('draw', { x: 0, y: 0 }, (newNode) =>
            setNodes((prevNodes) => [...prevNodes, newNode])
          )
        }
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
