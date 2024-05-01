import { Node, XYPosition } from 'reactflow';
import type { Json, Tables } from '@/types_db';
import {
  getNodeSpecificProperties,
  defaultNodeDimensions
} from './nodeProperties';
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
  existingNodes: Node<any>[]
): boolean {
  const nodeDimensions = defaultNodeDimensions;

  for (let node of existingNodes) {
    if (
      newPosition.x < node.position.x + nodeDimensions.width &&
      newPosition.x + nodeDimensions.width > node.position.x &&
      newPosition.y < node.position.y + nodeDimensions.height &&
      newPosition.y + nodeDimensions.height > node.position.y
    ) {
      return true;
    }
  }

  return false;
}

export const createNode = (
  nodeType: 'note' | 'task' | 'custom' | 'code' | 'draw',
  position: { x: number; y: number },
  existingNodes: Node<any>[],
  callback: (newNode: Node<any>) => void,
  canvasSize: { width: number; height: number }
) => {
  const zoomLevel = 1.0;
  position.x /= zoomLevel;
  position.y /= zoomLevel;

  const defaultNodeDimensions = { width: 100, height: 150 };

  if (Array.isArray(existingNodes)) {
    while (isPositionOccupied(position, existingNodes)) {
      const randomOffsetX =
        Math.random() * defaultNodeDimensions.width -
        defaultNodeDimensions.width / 2;
      const randomOffsetY =
        Math.random() * defaultNodeDimensions.height -
        defaultNodeDimensions.height / 2;
      position.x += defaultNodeDimensions.width / 2 + randomOffsetX;
      position.y += defaultNodeDimensions.height / 2 + randomOffsetY;
    }
  }
  position.x = Math.max(
    0,
    Math.min(position.x, canvasSize.width - defaultNodeDimensions.width)
  );
  position.y = Math.max(
    0,
    Math.min(position.y, canvasSize.height - defaultNodeDimensions.height)
  );

  const positionAsXYPosition = setPosition(position.x, position.y);

  const defaultProperties = {
    draggable: true,
    connectable: true,
    width: defaultNodeDimensions.width,
    height: defaultNodeDimensions.height,
    title: `New ${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)}`
  };

  const baseProperties: Partial<BaseNode> & {
    id: string;
    position: XYPosition;
  } = {
    id: `${nodeType}-${nanoid()}`,
    type: nodeType,
    position: positionAsXYPosition,
    ...defaultProperties
  };

  const specificNode = {
    ...baseProperties,
    ...getNodeSpecificProperties(nodeType)
  };

  const newNode: Node<any> = {
    ...specificNode,
    data: specificNode,
    id: baseProperties.id,
    position: {
      x: position.x,
      y: position.y
    }
  };

  console.log('Adding new node:', newNode);
  callback(newNode);
};
