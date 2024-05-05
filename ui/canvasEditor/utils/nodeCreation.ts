import { Node, XYPosition } from 'reactflow';
import type { Json, Tables } from '@/types_db';
import { getNodeSpecificProperties, nodeDimensions } from './nodeProperties';
import { nanoid } from 'nanoid';

type BaseNode = Tables<'base_nodes'>;

interface JsonPosition {
  x: number;
  y: number;
  [key: string]: Json | number | undefined;
}

const setPosition = (x: number, y: number): JsonPosition => {
  return { x, y };
};

function isPositionOccupied(
  newPosition: { x: number; y: number },
  existingNodes: Node<any>[],
  nodeDimension: { width: number; height: number }
): boolean {
  return existingNodes.some(
    (node) =>
      newPosition.x < node.position.x + nodeDimension.width &&
      newPosition.x + nodeDimension.width > node.position.x &&
      newPosition.y < node.position.y + nodeDimension.height &&
      newPosition.y + nodeDimension.height > node.position.y
  );
}

export const createNode = (
  nodeType: 'note' | 'task' | 'custom' | 'code' | 'draw' | 'selectionMenu',
  position: { x: number; y: number },
  existingNodes: Node<any>[],
  callback: (newNode: Node<any>) => void,
  canvasSize: { width: number; height: number },
  isTemporary = false, // Added new parameter to indicate temporary NodeSelectionMenu
  isEditing = false
) => {
  console.log('Creating node:', nodeType);
  const zoomLevel = 1.0;
  position.x /= zoomLevel;
  position.y /= zoomLevel;

  const dimensions = nodeDimensions[nodeType];
  let nodeDimension: { width: number; height: number };

  if (isEditing && 'editWidth' in dimensions && 'editHeight' in dimensions) {
    nodeDimension = {
      width: dimensions.editWidth,
      height: dimensions.editHeight
    };
  } else {
    nodeDimension = {
      width: dimensions.width,
      height: dimensions.height
    };
  }

  if (!Array.isArray(existingNodes)) {
    console.error('Invalid existingNodes array');
    return;
  }

  while (isPositionOccupied(position, existingNodes, nodeDimension)) {
    position.x += Math.random() * nodeDimension.width - nodeDimension.width / 2;
    position.y +=
      Math.random() * nodeDimension.height - nodeDimension.height / 2;
  }

  if (nodeType !== 'selectionMenu') {
    position.x = Math.max(
      0,
      Math.min(position.x, canvasSize.width - nodeDimension.width)
    );
    position.y = Math.max(
      0,
      Math.min(position.y, canvasSize.height - nodeDimension.height)
    );
  }

  const positionAsXYPosition = setPosition(position.x, position.y);

  const defaultProperties = {
    isEditing: isEditing,
    draggable: true,
    connectable: true,
    width: nodeDimension.width,
    height: nodeDimension.height,
    title: `New ${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)}`
  };

  let baseProperties: Partial<BaseNode> & {
    id: string;
    position: XYPosition;
    type: string;
  } = {
    id: `${nodeType}-${nanoid()}`,
    type: nodeType,
    position: positionAsXYPosition,
    ...defaultProperties
  };

  if (nodeType === 'selectionMenu' && isTemporary) {
    baseProperties.id = `selectionMenu-${nanoid()}`; // Different ID format for temporary NodeSelectionMenu
  }

  const specificNode = {
    ...baseProperties,
    ...(nodeType !== 'selectionMenu'
      ? getNodeSpecificProperties(nodeType, isEditing)
      : {})
  };

  const newNode: Node<any> = {
    ...specificNode,
    id: baseProperties.id,
    type: baseProperties.type,
    position: positionAsXYPosition,
    data: isTemporary ? { isTemporary: true } : specificNode,
    width: nodeDimensions[nodeType].width, // Use the width from nodeDimensions
    height: nodeDimensions[nodeType].height // Use the height from nodeDimensions
  };

  console.log('New node, nodeCreation:', newNode);
  console.log('Width, NodeCreation:', newNode.width);
  console.log('Height, NodeCreation:', newNode.height);

  callback(newNode);
};
