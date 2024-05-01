import React from 'react';
import {
  FaAngleDoubleRight,
  FaTasks,
  FaRegAddressBook,
  FaCode,
  FaPaintBrush,
  FaUndo,
  FaRedo,
  FaShare,
  FaDownload
} from 'react-icons/fa';

import { PiNotepad } from 'react-icons/pi';
import Link from 'next/link';
import { useStore } from '@/app/store/useCanvasStore';
import { createNode } from '@/ui/canvasEditor/utils/nodeCreation';

interface ToolbarProps {
  onUndo: () => void;
  onRedo: () => void;
  onShare: () => void;
  onDownload: () => void;
  addNode: (node: Node) => void;
  reactFlowInstance: any;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onUndo,
  onRedo,
  onShare,
  onDownload,
  reactFlowInstance
}) => {
  const addNode = useStore((state) => state.addNode);
  const nodes = useStore((state) => state.nodes); // Fetch the existing nodes from the store

  const handleAddNode = (
    type: 'note' | 'task' | 'custom' | 'code' | 'draw'
  ) => {
    const canvasSize = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    const position = {
      x: canvasSize.width / 2 - 50 + nodes.length * 10, // Adjust the initial position based on the number of existing nodes
      y: canvasSize.height / 2 - 75 + nodes.length * 10
    };

    createNode(
      type,
      position,
      nodes,
      (node) => {
        addNode(node);
        if (reactFlowInstance) {
          reactFlowInstance.setCenter(
            node.position.x,
            node.position.y,
            reactFlowInstance.zoomPanHelper.transform.k
          );
        }
      },
      canvasSize
    ); // Pass the existing nodes to the createNode function
  };

  const buttonClass = 'p-2 bg-gray-200 rounded hover:bg-gray-300';

  return (
    <div className="absolute top-0 left-0 z-10 flex flex-col items-center space-y-2 p-2">
      <Link href="/workspace/canvases" passHref>
        <button className={buttonClass} title="Open Editor">
          <FaAngleDoubleRight size="16" />
        </button>
      </Link>

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
        title="Add Custom"
      >
        <FaRegAddressBook size="16" />
      </button>
      <button
        onClick={() => handleAddNode('code')}
        className={buttonClass}
        title="Add Code"
      >
        <FaCode size="16" />
      </button>
      <button
        onClick={() => handleAddNode('draw')}
        className={buttonClass}
        title="Add Draw"
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
