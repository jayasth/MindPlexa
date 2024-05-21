import React, { useState } from 'react';
import {
  FaAngleDoubleRight,
  FaAngleDoubleLeft,
  FaBrain,
  FaTasks,
  FaRegAddressBook,
  FaCode,
  FaPaintBrush,
  FaUndo,
  FaRedo,
  FaShare,
  FaDownload,
  FaHome
} from 'react-icons/fa';
import { MdFormatListBulletedAdd } from 'react-icons/md';
import { nanoid } from 'nanoid';

import { PiNotepad } from 'react-icons/pi';
import Link from 'next/link';
import { useStore } from '@/app/store/useCanvasStore';
import { createNode } from '@/ui/canvasEditor/utils/nodeCreation';
import { findOptimalPosition } from '@/ui/canvasEditor/utils/positioningUtils';
import { getNodeSpecificProperties } from '@/ui/canvasEditor/utils/nodeProperties';
import styles from './Toolbar.module.css';

interface ToolbarProps {
  onUndo: () => void;
  onRedo: () => void;
  onShare: () => void;
  onDownload: () => void;
  addNode: (node: Node) => void;
  reactFlowInstance: any;
  onGenerateMindmap: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onUndo,
  onRedo,
  onShare,
  onDownload,
  reactFlowInstance,
  onGenerateMindmap
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const addNode = useStore((state) => state.addNode);
  const nodes = useStore((state) => state.nodes);

  const handleAddNode = (
    type: 'note' | 'task' | 'custom' | 'code' | 'draw' | 'selectionMenu'
  ) => {
    try {
      const canvasSize = {
        width: window.innerWidth,
        height: window.innerHeight
      };

      const position = findOptimalPosition(nodes, canvasSize);
      const nodeProps = getNodeSpecificProperties(type, false);

      createNode(
        type,
        position,
        nodes,
        (node) => {
          addNode(node);
          if (reactFlowInstance && nodes.length === 0) {
            // Only center if it's the first node
            reactFlowInstance.setCenter(node.position.x, node.position.y, {
              zoom: 1
            });
          }
        },
        nodeProps
      );
    } catch (error) {
      console.error(`Failed to add node of type ${type}:`, error);
    }
  };

  const toggleToolbar = () => {
    setIsOpen(!isOpen);
  };

  const buttonClass = `${styles.button} ${isOpen ? styles.open : ''}`;

  return (
    <>
      {!isOpen && (
        <button
          className={styles.showButton}
          onClick={toggleToolbar}
          title="Show Toolbar"
        >
          <FaAngleDoubleRight />
        </button>
      )}
      <div className={`${styles.toolbar} ${isOpen ? styles.open : ''}`}>
        <button
          className={styles.toggleButton}
          onClick={toggleToolbar}
          title={isOpen ? 'Hide Toolbar' : 'Show Toolbar'}
        >
          {isOpen ? <FaAngleDoubleLeft /> : <FaAngleDoubleRight />}
        </button>
        {isOpen && (
          <>
            <Link href="/workspace/canvases" passHref>
              <button className={buttonClass} title="Open Editor">
                <FaHome />
              </button>
            </Link>
            <button
              onClick={onGenerateMindmap}
              className={buttonClass}
              title="Generate Mindmap"
            >
              <FaBrain />
            </button>
            <button
              onClick={() => handleAddNode('note')}
              className={buttonClass}
              title="Add Note"
            >
              <PiNotepad />
            </button>
            <button
              onClick={() => handleAddNode('task')}
              className={buttonClass}
              title="Add Task"
            >
              <FaTasks />
            </button>
            <button
              onClick={() => handleAddNode('custom')}
              className={buttonClass}
              title="Add Custom"
            >
              <FaRegAddressBook />
            </button>
            <button
              onClick={() => handleAddNode('code')}
              className={buttonClass}
              title="Add Code"
            >
              <FaCode />
            </button>
            <button
              onClick={() => handleAddNode('draw')}
              className={buttonClass}
              title="Add Draw"
            >
              <FaPaintBrush />
            </button>
            <button
              onClick={() => handleAddNode('selectionMenu')}
              className={buttonClass}
              title="Add Node Selection Menu"
            >
              <MdFormatListBulletedAdd />
            </button>
            <button onClick={onUndo} className={buttonClass} title="Undo">
              <FaUndo />
            </button>
            <button onClick={onRedo} className={buttonClass} title="Redo">
              <FaRedo />
            </button>
            <button onClick={onShare} className={buttonClass} title="Share">
              <FaShare />
            </button>
            <button
              onClick={onDownload}
              className={buttonClass}
              title="Download"
            >
              <FaDownload />
            </button>
          </>
        )}
      </div>
    </>
  );
};

export default Toolbar;
