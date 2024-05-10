import { Node, XYPosition } from 'reactflow';
import type { Json, Tables } from '@/types_db';
import { getNodeSpecificProperties, nodeDimensions } from './nodeProperties';
import { nanoid } from 'nanoid';
import { useStore } from '@/app/store/useCanvasStore';

const setPosition = (x: number, y: number): XYPosition => {
  return { x, y };
};

function isPositionOccupied(
  newPosition: XYPosition,
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

function findAvailablePosition(
  initialPosition: XYPosition,
  nodeDimension: { width: number; height: number },
  nodes: Node<any>[]
): XYPosition {
  const stepSize = 10;
  let x = 0,
    y = 0;
  let dx = 0;
  let dy = -1;
  let maxI = 100;

  for (let i = 0; i < maxI; i++) {
    let newX = initialPosition.x + x * stepSize;
    let newY = initialPosition.y + y * stepSize;

    if (!isPositionOccupied({ x: newX, y: newY }, nodes, nodeDimension)) {
      return { x: newX, y: newY };
    }

    if (x === y || (x < 0 && x === -y) || (x > 0 && x === 1 - y)) {
      [dx, dy] = [-dy, dx];
    }
    [x, y] = [x + dx, y + dy];
  }

  console.error(
    'nodeCreation: Failed to find an available position for the node'
  );
  return initialPosition;
}

export const createNode = (
  nodeType: 'note' | 'task' | 'custom' | 'code' | 'draw' | 'selectionMenu',
  position: XYPosition,
  nodes: Node<any>[],
  callback: (newNode: Node<any>) => void,
  canvasSize: { width: number; height: number },
  isTemporary = nodeType === 'selectionMenu',
  isEditing = false,
  parentNode?: Node<any> | null,
  temporaryNodeId?: string
) => {
  const nodeDimension = nodeDimensions[nodeType];
  const availablePosition = findAvailablePosition(
    position,
    nodeDimension,
    nodes
  );

  if (isPositionOccupied(availablePosition, nodes, nodeDimension)) {
    console.error(
      'NodeCreation: Position is already occupied. Skipping node creation.'
    );
    return;
  }

  const positionAsXYPosition: XYPosition = setPosition(
    availablePosition.x,
    availablePosition.y
  );

  const nodeId = temporaryNodeId || `${nodeType}-${nanoid()}`;

  const defaultProperties = {
    draggable: true,
    connectable: true,
    selectable: true
  };

  const baseProperties: Partial<Node<any>> = {
    id: nodeId,
    type: nodeType,
    position: positionAsXYPosition,
    ...defaultProperties
  };

  const specificNode = {
    ...baseProperties,
    ...getNodeSpecificProperties(nodeType, isEditing)
  };

  const newNode: Node<any> = {
    ...specificNode,
    id: baseProperties.id || '',
    type: baseProperties.type || '',
    position: positionAsXYPosition,
    data: specificNode,
    width: nodeDimension.width,
    height: nodeDimension.height
  };

  if (parentNode) {
    newNode.data = {
      ...newNode.data,
      parentNode: parentNode
    };
  }

  console.log('nodeCreation: New node:', newNode);

  callback(newNode);
};
