import { Node, XYPosition } from 'reactflow';
import type { Json, Tables } from '@/types_db';
import { getNodeSpecificProperties, nodeDimensions } from './nodeProperties';
import { nanoid } from 'nanoid';
import { useStore } from '@/app/store/useCanvasStore';

const setPosition = (x: number, y: number): XYPosition => {
  return { x, y };
};

function findNewPosition(
  nodes: Node<any>[],
  canvasSize: { width: number; height: number }
): XYPosition {
  if (nodes.length === 0) {
    return { x: canvasSize.width / 2, y: canvasSize.height / 2 };
  }

  const lastNode = nodes[nodes.length - 1];
  const newPosition = {
    x: lastNode.position.x + 50,
    y: lastNode.position.y + 50
  };

  if (newPosition.x + 100 > canvasSize.width) {
    newPosition.x = 50;
  }
  if (newPosition.y + 100 > canvasSize.height) {
    newPosition.y = 50;
  }

  return newPosition;
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
  const availablePosition = findNewPosition(nodes, canvasSize);

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
export { getNodeSpecificProperties };
