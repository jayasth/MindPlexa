import { Node, XYPosition } from 'reactflow';
import { getNodeSpecificProperties, nodeDimensions } from './nodeProperties';
import { nanoid } from 'nanoid';
import { findOptimalPosition } from './positioningUtils';
import { createNode as createNodeInDatabase } from '@/utils/supabase/databaseOperations';

const setPosition = (x: number, y: number): XYPosition => {
  return { x, y };
};

function findNewPosition(
  nodes: Node<any>[],
  canvasSize: { width: number; height: number }
): XYPosition {
  return findOptimalPosition(nodes, canvasSize);
}

export const createNode = async (
  nodeType: 'note' | 'task' | 'table' | 'calendar' | 'draw' | 'selectionMenu',
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
    ...getNodeSpecificProperties(nodeType, isEditing),
    width: nodeDimension.width,
    height: nodeDimension.height
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

  try {
    const { data: createdNode, error } = await createNodeInDatabase(newNode);
    if (error) {
      throw new Error(error);
    }
    if (createdNode) {
      callback(createdNode);
    } else {
      throw new Error('Node creation failed');
    }
  } catch (error) {
    console.error('Error creating new node:', error);
  }
};

export { getNodeSpecificProperties };
