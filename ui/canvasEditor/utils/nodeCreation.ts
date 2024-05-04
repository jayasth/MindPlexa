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
  for (let node of existingNodes) {
    if (
      newPosition.x < node.position.x + nodeDimension.width &&
      newPosition.x + nodeDimension.width > node.position.x &&
      newPosition.y < node.position.y + nodeDimension.height &&
      newPosition.y + nodeDimension.height > node.position.y
    ) {
      return true;
    }
  }

  return false;
}

export const createNode = (
  nodeType: 'note' | 'task' | 'custom' | 'code' | 'draw' | 'selectionMenu',
  position: { x: number; y: number },
  existingNodes: Node<any>[],
  callback: (newNode: Node<any>) => void,
  canvasSize: { width: number; height: number },
  isTemporary = false
) => {
  const zoomLevel = 1.0;
  position.x /= zoomLevel;
  position.y /= zoomLevel;

  const nodeDimension = nodeDimensions[nodeType];

  if (Array.isArray(existingNodes)) {
    while (isPositionOccupied(position, existingNodes, nodeDimension)) {
      const randomOffsetX =
        Math.random() * nodeDimension.width - nodeDimension.width / 2;
      const randomOffsetY =
        Math.random() * nodeDimension.height - nodeDimension.height / 2;
      position.x += nodeDimension.width / 2 + randomOffsetX;
      position.y += nodeDimension.height / 2 + randomOffsetY;
    }
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
    draggable: true,
    connectable: true,
    width: nodeDimensions[nodeType].width,
    height: nodeDimensions[nodeType].height,
    title: `New ${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)}`
  };
  let baseProperties: Partial<BaseNode> & {
    id: string;
    position: XYPosition;
    type: string;
  };

  if (nodeType === 'selectionMenu' && isTemporary) {
    baseProperties = {
      id: `selectionMenu-${nanoid()}`,
      type: 'selectionMenu',
      position: setPosition(position.x, position.y),
      ...defaultProperties
    };
  } else {
    baseProperties = {
      id: `${nodeType}-${nanoid()}`,
      type: nodeType,
      position: { x: position.x, y: position.y },
      ...defaultProperties
    };
  }
  const specificNode = {
    ...baseProperties,
    ...(nodeType !== 'selectionMenu' ? getNodeSpecificProperties(nodeType) : {})
  };

  const newNode: Node<any> = {
    ...specificNode,
    id: baseProperties.id,
    type: baseProperties.type,
    position: {
      x: position.x,
      y: position.y
    },
    data: isTemporary ? { isTemporary: true } : specificNode
  };

  callback(newNode);
};
