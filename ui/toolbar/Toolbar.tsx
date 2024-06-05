import React, { useState } from 'react';
import {
  MdOutlineKeyboardDoubleArrowLeft,
  MdOutlineKeyboardDoubleArrowRight
} from 'react-icons/md';

import {
  CiHome,
  CiStickyNote,
  CiBoxList,
  CiViewTable,
  CiCalendarDate,
  CiUndo,
  CiRedo,
  CiShare1
} from 'react-icons/ci';
import { PiNetworkThin } from 'react-icons/pi';
import {
  IoBrushOutline,
  IoDownloadOutline,
  IoAppsOutline
} from 'react-icons/io5';

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
    type: 'note' | 'task' | 'table' | 'calendar' | 'draw' | 'selectionMenu'
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
  const iconSize = 16;

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
                <CiHome size={iconSize} />
              </button>
            </Link>
            <button
              onClick={onGenerateMindmap}
              className={buttonClass}
              title="Generate Mindmap"
            >
              <PiNetworkThin size={iconSize} />
            </button>
            <button
              onClick={() => handleAddNode('selectionMenu')}
              className={buttonClass}
              title="Selection Menu"
            >
              <IoAppsOutline size={iconSize} />
            </button>
            <button
              onClick={() => handleAddNode('note')}
              className={buttonClass}
              title="Note"
            >
              <CiStickyNote size={iconSize} />
            </button>
            <button
              onClick={() => handleAddNode('task')}
              className={buttonClass}
              title="Task"
            >
              <CiBoxList size={iconSize} />
            </button>
            <button
              onClick={() => handleAddNode('table')}
              className={buttonClass}
              title="Table"
            >
              <CiViewTable size={iconSize} />
            </button>
            <button
              onClick={() => handleAddNode('calendar')}
              className={buttonClass}
              title="Calendar"
            >
              <CiCalendarDate size={iconSize} />
            </button>
            <button
              onClick={() => handleAddNode('draw')}
              className={buttonClass}
              title="Draw"
            >
              <IoBrushOutline size={iconSize} />
            </button>

            <button onClick={onUndo} className={buttonClass} title="Undo">
              <CiUndo size={iconSize} />
            </button>
            <button onClick={onRedo} className={buttonClass} title="Redo">
              <CiRedo size={iconSize} />
            </button>
            <button onClick={onShare} className={buttonClass} title="Share">
              <CiShare1 size={iconSize} />
            </button>
            <button
              onClick={onDownload}
              className={buttonClass}
              title="Download"
            >
              <IoDownloadOutline size={iconSize} />
            </button>
          </>
        )}
      </div>
    </>
  );
};

export default Toolbar;
