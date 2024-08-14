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
import { useNodeStore, useUIStore, useCanvasStore } from '@/app/store';
import { createNode } from '@/ui/canvasEditor/utils/nodeCreation';
import { findOptimalPosition } from '@/ui/canvasEditor/utils/positioningUtils';
import { getNodeSpecificProperties } from '@/ui/canvasEditor/utils/nodeProperties';
import styles from './Toolbar.module.css';
import { Tooltip } from '@/ui/Tooltip/Tooltip';
import AIGeneratorModalV1 from '@/ui/ai/generator/AIGeneratorModalV1';
import AIGeneratorModalV2 from '@/ui/ai/generator/AIGeneratorModalV2';

interface ToolbarProps {
  canvasId: string;
  onDownload: () => void;
  reactFlowInstance: any;
}

const Toolbar: React.FC<ToolbarProps> = ({
  canvasId,
  onDownload,
  reactFlowInstance
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [showAIGeneratorV1, setShowAIGeneratorV1] = useState(false);
  const [showAIGeneratorV2, setShowAIGeneratorV2] = useState(false);
  const addNode = useNodeStore((state) => state.addNode);
  const nodes = useNodeStore((state) => state.nodes);
  const setCanvasId = useCanvasStore((state) => state.setCanvasId);
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
        const nodeProps = getNodeSpecificProperties(type, false);

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

  const handleGenerateAIMapV1 = () => {
    setShowAIGeneratorV1(true);
  };

  const handleGenerateAIMapV2 = () => {
    setShowAIGeneratorV2(true);
  };

  const buttonClass = `${styles.button} ${isOpen ? styles.open : ''}`;
  const iconSize = 20;

  return (
    <>
      {!isOpen && (
        <Tooltip content="Show Toolbar">
          <button className={styles.showButton} onClick={toggleToolbar}>
            <MdOutlineKeyboardDoubleArrowRight size={iconSize} />
          </button>
        </Tooltip>
      )}
      <div className={`${styles.toolbar} ${isOpen ? styles.open : ''}`}>
        <Tooltip content={isOpen ? 'Hide Toolbar' : 'Show Toolbar'}>
          <button className={styles.toggleButton} onClick={toggleToolbar}>
            {isOpen ? (
              <MdOutlineKeyboardDoubleArrowLeft size={iconSize} />
            ) : (
              <MdOutlineKeyboardDoubleArrowRight size={iconSize} />
            )}
          </button>
        </Tooltip>
        {isOpen && (
          <>
            <Link href="/workspace/canvases" passHref>
              <Tooltip content="Open Editor">
                <button className={buttonClass}>
                  <AiOutlineHome size={iconSize} />
                </button>
              </Tooltip>
            </Link>
            <Tooltip content="AI Custom Layout">
              <button onClick={handleGenerateAIMapV1} className={buttonClass}>
                <LuNetwork size={iconSize} />
              </button>
            </Tooltip>
            <Tooltip content="AI Smart Layout">
              <button onClick={handleGenerateAIMapV2} className={buttonClass}>
                <FaRobot size={iconSize} />
              </button>
            </Tooltip>
            <Tooltip content="Selection Menu">
              <button
                onClick={() => handleAddNode('selection_menu')}
                className={buttonClass}
              >
                <HiOutlineViewGridAdd size={iconSize} />
              </button>
            </Tooltip>
            <Tooltip content="Note">
              <button
                onClick={() => handleAddNode('note')}
                className={buttonClass}
              >
                <PiNotepad size={iconSize} />
              </button>
            </Tooltip>
            <Tooltip content="Task">
              <button
                onClick={() => handleAddNode('task')}
                className={buttonClass}
              >
                <IoList size={iconSize} />
              </button>
            </Tooltip>
            <Tooltip content="Table">
              <button
                onClick={() => handleAddNode('table')}
                className={buttonClass}
              >
                <AiOutlineTable size={iconSize} />
              </button>
            </Tooltip>
            <Tooltip content="Calendar">
              <button
                onClick={() => handleAddNode('calendar')}
                className={buttonClass}
              >
                <MdCalendarMonth size={iconSize} />
              </button>
            </Tooltip>
            <Tooltip content="Draw">
              <button
                onClick={() => handleAddNode('draw')}
                className={buttonClass}
              >
                <GiPencilBrush size={iconSize} />
              </button>
            </Tooltip>

            <Tooltip content="Download">
              <button onClick={onDownload} className={buttonClass}>
                <IoDownload size={iconSize} />
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
    </>
  );
};

export default Toolbar;
