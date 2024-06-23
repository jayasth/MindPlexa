import React, { useState } from 'react';
import {
  MdOutlineKeyboardDoubleArrowLeft,
  MdOutlineKeyboardDoubleArrowRight
} from 'react-icons/md';
import { PiNetworkFill } from 'react-icons/pi';
import {
  IoHome,
  IoList,
  IoCalendar,
  IoBrush,
  IoArrowUndo,
  IoArrowRedo,
  IoShare,
  IoDownload,
  IoApps
} from 'react-icons/io5';
import { PiNotepadFill } from 'react-icons/pi';
import { FaTable } from 'react-icons/fa6';

import Link from 'next/link';
import { useStore } from '@/app/store/useCanvasStore';
import { createNode } from '@/ui/canvasEditor/utils/nodeCreation';
import { findOptimalPosition } from '@/ui/canvasEditor/utils/positioningUtils';
import { getNodeSpecificProperties } from '@/ui/canvasEditor/utils/nodeProperties';
import styles from './Toolbar.module.css';

interface ToolbarProps {
  canvasId: string; // Add this line
  onUndo: () => void;
  onRedo: () => void;
  onShare: () => void;
  onDownload: () => void;
  addNode: (node: Node) => void;
  reactFlowInstance: any;
  onGenerateMindmap: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  canvasId,
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

  const handleAddNode = async (
    type: 'note' | 'task' | 'table' | 'calendar' | 'draw' | 'selectionMenu'
  ) => {
    try {
      const canvasSize = {
        width: window.innerWidth,
        height: window.innerHeight
      };

      const position = findOptimalPosition(nodes, canvasSize);
      const nodeProps = getNodeSpecificProperties(type, false);

      await createNode(
        type,
        position,
        nodes,
        (node) => {
          addNode(node);
          if (reactFlowInstance && nodes.length === 0) {
            reactFlowInstance.setCenter(node.position.x, node.position.y, {
              zoom: 1
            });
          }
        },
        canvasSize,
        false, // isTemporary
        false, // isEditing
        canvasId
      );
      console.log('Toolbar: Canvas ID:', canvasId);
    } catch (error) {
      console.error(`Failed to add node of type ${type}:`, error);
    }
  };

  const toggleToolbar = () => {
    setIsOpen(!isOpen);
  };

  const buttonClass = `${styles.button} ${isOpen ? styles.open : ''}`;
  const iconSize = 20;

  return (
    <>
      {!isOpen && (
        <button
          className={styles.showButton}
          onClick={toggleToolbar}
          title="Show Toolbar"
        >
          <MdOutlineKeyboardDoubleArrowRight size={iconSize} />
        </button>
      )}
      <div className={`${styles.toolbar} ${isOpen ? styles.open : ''}`}>
        <button
          className={styles.toggleButton}
          onClick={toggleToolbar}
          title={isOpen ? 'Hide Toolbar' : 'Show Toolbar'}
        >
          {isOpen ? (
            <MdOutlineKeyboardDoubleArrowLeft size={iconSize} />
          ) : (
            <MdOutlineKeyboardDoubleArrowRight size={iconSize} />
          )}
        </button>
        {isOpen && (
          <>
            <Link href="/workspace/canvases" passHref>
              <button className={buttonClass} title="Open Editor">
                <IoHome size={iconSize} />
              </button>
            </Link>
            <button
              onClick={onGenerateMindmap}
              className={buttonClass}
              title="Generate Mindmap"
            >
              <PiNetworkFill size={iconSize} />
            </button>
            <button
              onClick={() => handleAddNode('selectionMenu')}
              className={buttonClass}
              title="Selection Menu"
            >
              <IoApps size={iconSize} />
            </button>
            <button
              onClick={() => handleAddNode('note')}
              className={buttonClass}
              title="Note"
            >
              <PiNotepadFill size={iconSize} />
            </button>
            <button
              onClick={() => handleAddNode('task')}
              className={buttonClass}
              title="Task"
            >
              <IoList size={iconSize} />
            </button>
            <button
              onClick={() => handleAddNode('table')}
              className={buttonClass}
              title="Table"
            >
              <FaTable size={iconSize} />
            </button>
            <button
              onClick={() => handleAddNode('calendar')}
              className={buttonClass}
              title="Calendar"
            >
              <IoCalendar size={iconSize} />
            </button>
            <button
              onClick={() => handleAddNode('draw')}
              className={buttonClass}
              title="Draw"
            >
              <IoBrush size={iconSize} />
            </button>

            <button onClick={onUndo} className={buttonClass} title="Undo">
              <IoArrowUndo size={iconSize} />
            </button>
            <button onClick={onRedo} className={buttonClass} title="Redo">
              <IoArrowRedo size={iconSize} />
            </button>
            <button onClick={onShare} className={buttonClass} title="Share">
              <IoShare size={iconSize} />
            </button>
            <button
              onClick={onDownload}
              className={buttonClass}
              title="Download"
            >
              <IoDownload size={iconSize} />
            </button>
          </>
        )}
      </div>
    </>
  );
};

export default Toolbar;
