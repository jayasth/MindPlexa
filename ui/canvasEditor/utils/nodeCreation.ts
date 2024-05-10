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

  if (isPositionOccupied(position, nodes, nodeDimension)) {
    console.error(
      'NodeCreation: Position is already occupied. Skipping node creation.'
    );
    return;
  }

  const positionAsXYPosition: XYPosition = setPosition(position.x, position.y);

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
