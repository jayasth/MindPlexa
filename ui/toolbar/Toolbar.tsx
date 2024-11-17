import React, { useState, useCallback } from 'react';
import {
  MdOutlineKeyboardDoubleArrowLeft,
  MdOutlineKeyboardDoubleArrowRight
} from 'react-icons/md';
import { LuNetwork } from 'react-icons/lu';
import { IoList, IoDownload } from 'react-icons/io5';
import { PiNotepad } from 'react-icons/pi';
import { MdCalendarMonth } from 'react-icons/md';
import { AiOutlineTable, AiOutlineHome } from 'react-icons/ai';
import { GiPencilBrush } from 'react-icons/gi';
import { HiOutlineViewGridAdd } from 'react-icons/hi';
import { FaRobot } from 'react-icons/fa';

import Link from 'next/link';
import { useNodeStore, useUIStore } from '@/app/store';
import { createNode } from '@/ui/canvasEditor/utils/nodeCreation';
import { findOptimalPosition } from '@/ui/canvasEditor/utils/positioningUtils';
import styles from './Toolbar.module.css';
import { Tooltip } from '@/ui/Tooltip/Tooltip';
import AIGeneratorModalV1 from '@/ui/ai/generator/AIGeneratorModalV1';
import AIGeneratorModalV2 from '@/ui/ai/generator/AIGeneratorModalV2';
import AIGeneratorModalV3 from '@/ui/ai/generator/AIGeneratorModalV3';
import { ReactFlowInstance } from 'reactflow';

interface ToolbarProps {
  canvasId: string;
  onDownload: () => void;
  reactFlowInstance: ReactFlowInstance | null;
}

const Toolbar: React.FC<ToolbarProps> = ({
  canvasId,
  onDownload,
  reactFlowInstance
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAIGeneratorV1, setShowAIGeneratorV1] = useState(false);
  const [showAIGeneratorV2, setShowAIGeneratorV2] = useState(false);
  const [showAIGeneratorV3, setShowAIGeneratorV3] = useState(false);
  const addNode = useNodeStore((state) => state.addNode);
  const nodes = useNodeStore((state) => state.nodes);
  const screenToFlowPosition = useUIStore(
    (state) => state.screenToFlowPosition
  );

  const handleAddNode = useCallback(
    async (
      type: 'note' | 'task' | 'table' | 'calendar' | 'draw' | 'selection_menu'
    ) => {
      try {
        const canvasSize = {
          width: window.innerWidth,
          height: window.innerHeight
        };

        const position = findOptimalPosition(nodes, canvasSize);

        await createNode(
          type,
          position,
          nodes,
          (node) => {
            addNode(node, canvasId);
            console.log('Toolbar: Node created:', node);
            if (reactFlowInstance && nodes.length === 0) {
              const flowPosition = screenToFlowPosition(node.position);
              reactFlowInstance.setCenter(flowPosition.x, flowPosition.y, {
                zoom: 1
              });
            }
          },
          canvasSize,
          type === 'selection_menu', // isTemporary
          false, // isEditing
          canvasId,
          undefined, // parentNode
          undefined // temporaryNodeId
        );
      } catch (error) {
        console.error(`Failed to create node of type ${type}:`, error);
      }
    },
    [addNode, canvasId, nodes, reactFlowInstance, screenToFlowPosition]
  );

  const toggleToolbar = () => {
    setIsOpen(!isOpen);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleGenerateAIMapV1 = () => {
    setShowAIGeneratorV1(true);
  };

  const handleGenerateAIMapV2 = () => {
    setShowAIGeneratorV2(true);
  };

  const handleGenerateAIMapV3 = () => {
    setShowAIGeneratorV3(true);
  };

  const buttonClass = `${styles.button} ${isExpanded ? styles.expanded : ''}`;
  const iconSize = 20;

  return (
    <>
      <div
        className={`${styles.toolbar} ${isOpen ? styles.open : ''} ${isExpanded ? styles.expanded : ''}`}
      >
        <Tooltip content={isOpen ? 'Hide Toolbar' : 'Show Toolbar'}>
          <button
            className={`${styles.toggleButton} ${styles.toolbarTooltip}`}
            onClick={toggleToolbar}
          >
            {isOpen ? (
              <MdOutlineKeyboardDoubleArrowLeft size={iconSize} />
            ) : (
              <MdOutlineKeyboardDoubleArrowRight size={iconSize} />
            )}
          </button>
        </Tooltip>
        {isOpen && (
          <>
            <Tooltip content={isExpanded ? 'Hide Labels' : 'Show Labels'}>
              <button
                className={`${styles.expandButton} ${styles.toolbarTooltip}`}
                onClick={toggleExpand}
              >
                {isExpanded ? '>>' : '<<'}
              </button>
            </Tooltip>
            <Link href="/workspace/canvases" passHref>
              <Tooltip content="Open Editor">
                <button className={`${buttonClass} ${styles.toolbarTooltip}`}>
                  <AiOutlineHome size={iconSize} />
                  {isExpanded && (
                    <span className={styles.buttonText}>Open Editor</span>
                  )}
                </button>
              </Tooltip>
            </Link>
            <div className={styles.separator} />
            <Tooltip content="Selection Menu">
              <button
                onClick={() => handleAddNode('selection_menu')}
                className={`${buttonClass} ${styles.toolbarTooltip}`}
              >
                <HiOutlineViewGridAdd size={iconSize} />
                {isExpanded && (
                  <span className={styles.buttonText}>Selection Menu</span>
                )}
              </button>
            </Tooltip>
            <Tooltip content="Note">
              <button
                onClick={() => handleAddNode('note')}
                className={`${buttonClass} ${styles.toolbarTooltip}`}
              >
                <PiNotepad size={iconSize} />
                {isExpanded && <span className={styles.buttonText}>Note</span>}
              </button>
            </Tooltip>
            <Tooltip content="Task">
              <button
                onClick={() => handleAddNode('task')}
                className={`${buttonClass} ${styles.toolbarTooltip}`}
              >
                <IoList size={iconSize} />
                {isExpanded && <span className={styles.buttonText}>Task</span>}
              </button>
            </Tooltip>
            <Tooltip content="Table">
              <button
                onClick={() => handleAddNode('table')}
                className={`${buttonClass} ${styles.toolbarTooltip}`}
              >
                <AiOutlineTable size={iconSize} />
                {isExpanded && <span className={styles.buttonText}>Table</span>}
              </button>
            </Tooltip>
            <Tooltip content="Calendar">
              <button
                onClick={() => handleAddNode('calendar')}
                className={`${buttonClass} ${styles.toolbarTooltip}`}
              >
                <MdCalendarMonth size={iconSize} />
                {isExpanded && (
                  <span className={styles.buttonText}>Calendar</span>
                )}
              </button>
            </Tooltip>
            <Tooltip content="Draw">
              <button
                onClick={() => handleAddNode('draw')}
                className={`${buttonClass} ${styles.toolbarTooltip}`}
              >
                <GiPencilBrush size={iconSize} />
                {isExpanded && <span className={styles.buttonText}>Draw</span>}
              </button>
            </Tooltip>
            <div className={styles.separator} />
            <Tooltip content="Custom AI Project Planner">
              <button
                onClick={handleGenerateAIMapV1}
                className={`${buttonClass} ${styles.toolbarTooltip}`}
              >
                <LuNetwork size={iconSize} />
                {isExpanded && (
                  <span className={styles.buttonText}>
                    Custom AI Project Planner
                  </span>
                )}
              </button>
            </Tooltip>
            <Tooltip content="Smart AI Project Architect">
              <button
                onClick={handleGenerateAIMapV2}
                className={`${buttonClass} ${styles.toolbarTooltip}`}
              >
                <FaRobot size={iconSize} />
                {isExpanded && (
                  <span className={styles.buttonText}>
                    Smart AI Project Architect
                  </span>
                )}
              </button>
            </Tooltip>
            <Tooltip content="AI Layout Generator V3 (Experimental)">
              <button
                onClick={handleGenerateAIMapV3}
                className={`${buttonClass} ${styles.toolbarTooltip}`}
              >
                <FaRobot size={iconSize} />
                {isExpanded && (
                  <span className={styles.buttonText}>
                    AI Layout Generator V3
                  </span>
                )}
              </button>
            </Tooltip>
            <div className={styles.separator} />
            <Tooltip content="Download">
              <button
                onClick={onDownload}
                className={`${buttonClass} ${styles.toolbarTooltip}`}
              >
                <IoDownload size={iconSize} />
                {isExpanded && (
                  <span className={styles.buttonText}>Download</span>
                )}
              </button>
            </Tooltip>
          </>
        )}
      </div>
      {showAIGeneratorV1 && (
        <AIGeneratorModalV1
          isOpen={showAIGeneratorV1}
          onClose={() => setShowAIGeneratorV1(false)}
        />
      )}
      {showAIGeneratorV2 && (
        <AIGeneratorModalV2
          isOpen={showAIGeneratorV2}
          onClose={() => setShowAIGeneratorV2(false)}
        />
      )}
      {showAIGeneratorV3 && (
        <AIGeneratorModalV3
          isOpen={showAIGeneratorV3}
          onClose={() => setShowAIGeneratorV3(false)}
        />
      )}
    </>
  );
};

export default Toolbar;
