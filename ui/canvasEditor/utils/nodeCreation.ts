import { Node, XYPosition } from 'reactflow';
import {
  getNodeSpecificProperties,
  nodeDimensions
} from '@/ui/canvasEditor/utils/nodeProperties';
import { findOptimalPosition } from '@/ui/canvasEditor/utils/positioningUtils';
import { createNode as createNodeInDatabase } from '@/utils/canvas/nodeEdgeDatabaseOperations';
import { v4 as uuidv4 } from 'uuid';
import { Database } from '@/types_db';

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
  nodeType: Database['public']['Enums']['node_type'],
  position: XYPosition,
  nodes: Node<any>[],
  callback: (newNode: Node<any>) => void,
  canvasSize: { width: number; height: number },
  isTemporary = nodeType === 'selectionMenu',
  isEditing = false,
  canvasId: string,
  parentNode?: Node<any> | null,
  temporaryNodeId?: string
): Promise<void> => {
  const nodeDimension = nodeDimensions[nodeType];
  const availablePosition = findNewPosition(nodes, canvasSize);
  const positionAsXYPosition: XYPosition = setPosition(
    availablePosition.x,
    availablePosition.y
  );

  const nodeId = temporaryNodeId || uuidv4();

  const defaultProperties = {
    draggable: true,
    connectable: true,
    backgroundColor: '#F4F4F4',
    textColor: '#575757'
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
    view_width:
      'width' in nodeDimension ? nodeDimension.width : nodeDimension.viewWidth,
    view_height:
      'height' in nodeDimension
        ? nodeDimension.height
        : nodeDimension.viewHeight,
    edit_width:
      'editWidth' in nodeDimension ? nodeDimension.editWidth : undefined,
    edit_height:
      'editHeight' in nodeDimension ? nodeDimension.editHeight : undefined
  };

  const newNode: Node<any> = {
    ...specificNode,
    id: baseProperties.id || '',
    type: baseProperties.type || '',
    position: positionAsXYPosition,
    data: {
      ...specificNode,
      view_width:
        'width' in nodeDimension
          ? nodeDimension.width
          : nodeDimension.viewWidth,
      view_height:
        'height' in nodeDimension
          ? nodeDimension.height
          : nodeDimension.viewHeight,
      edit_width:
        'editWidth' in nodeDimension ? nodeDimension.editWidth : undefined,
      edit_height:
        'editHeight' in nodeDimension ? nodeDimension.editHeight : undefined
    }
  };
  if (parentNode) {
    newNode.data = {
      ...newNode.data,
      parentNode: parentNode
    };
  }

  if (isTemporary) {
    newNode.data.is_temporary = true;
  }

  try {
    const newNodeData = {
      ...newNode.data,
      z_index: 0,
      is_temporary: isTemporary
    };

    const { data: createdNode, error } = await createNodeInDatabase(
      canvasId,
      nodeType,
      positionAsXYPosition,
      newNodeData
    );

    if (error) {
      console.error('NodeCreation: Database error:', error);
      throw new Error(error instanceof Error ? error.message : 'Unknown error');
    }

    if (createdNode) {
      const newNodeWithData: Node<any> = {
        ...newNode,
        data: createdNode
      };
      callback(newNodeWithData);
      console.log('nodeCreation: Canvas ID:', canvasId);
    } else {
      throw new Error('Node creation failed');
    }
  } catch (error) {
    console.error('NodeCreation: Error creating new node:', error);
  }
};
