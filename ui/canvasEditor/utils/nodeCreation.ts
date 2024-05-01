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
  const minimumDistance = 50; // Adjust this value based on your needs
  if (!Array.isArray(existingNodes)) {
    return false;
  }
  for (let node of existingNodes) {
    const distance = Math.sqrt(
      Math.pow(newPosition.x - node.position.x, 2) +
        Math.pow(newPosition.y - node.position.y, 2)
    );
    if (distance < minimumDistance) {
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

  if (Array.isArray(existingNodes)) {
    while (isPositionOccupied(position, existingNodes)) {
      position.x += 5;
      position.y += 5;
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
