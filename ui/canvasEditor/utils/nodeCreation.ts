import { Node, XYPosition } from 'reactflow';
import {
  getNodeSpecificProperties,
  nodeDimensions
} from '@/ui/canvasEditor/utils/nodeProperties';
import { findOptimalPosition } from '@/ui/canvasEditor/utils/positioningUtils';
import {
  createNode as createNodeInDatabase,
  createEdge,
  updateEdge as updateEdgeInDatabase
} from '@/utils/canvas/nodeEdgeDatabaseOperations';
import { v4 as uuidv4 } from 'uuid';
import { Database } from '@/types_db';
import useEdgeStore from '@/app/store/edges/useEdgeStore';

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
  isTemporary = nodeType === 'selection_menu',
  isEditing = false,
  canvasId: string,
  parentNode?: Node<any> | null,
  temporaryNodeId?: string
): Promise<void> => {
  const nodeId = temporaryNodeId || uuidv4();

  const nodeDimension = nodeDimensions[nodeType];
  const availablePosition = findNewPosition(nodes, canvasSize);
  const positionAsXYPosition: XYPosition = setPosition(
    availablePosition.x,
    availablePosition.y
  );

  const defaultProperties = {
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
    ...getNodeSpecificProperties(nodeType, isEditing)
  };

  const newNode: Node<any> = {
    ...specificNode,
    id: baseProperties.id || '',
    type: baseProperties.type || '',
    position: positionAsXYPosition,
    data: {
      ...specificNode
    }
  };
  if (parentNode) {
    newNode.data = {
      ...newNode.data,
      parentNode: parentNode
    };
  }

  if (isTemporary) {
    newNode.data.isTemporary = true;
  }

  try {
    const newNodeData = {
      id: nodeId,
      ...newNode.data,
      zIndex: 0,
      isTemporary: isTemporary,
      parentNodeId: parentNode ? parentNode.id : null,
      backgroundColor: defaultProperties.backgroundColor,
      textColor: defaultProperties.textColor,
      isEditing: isEditing,
      ...nodeDimension,
      viewWidth: nodeDimensions.selection_menu.width,
      viewHeight: nodeDimensions.selection_menu.height
    };

    if (nodeType === 'selection_menu') {
      newNodeData.viewWidth = nodeDimensions.selection_menu.width;
      newNodeData.viewHeight = nodeDimensions.selection_menu.height;
    }

    const { data: createdNode, error } = await createNodeInDatabase(
      canvasId,
      nodeType,
      positionAsXYPosition,
      newNodeData
    );

    if (error) {
      console.error('nodeCreation: Database error:', error);
      throw new Error(error instanceof Error ? error.message : 'Unknown error');
    }

    if (createdNode) {
      console.log(
        'nodeCreation: Creating node in database with data:',
        createdNode
      );
      const newNodeWithData: Node<any> = {
        ...newNode,
        id: createdNode.id,
        position: positionAsXYPosition,
        data: {
          ...createdNode,
          backgroundColor: createdNode.background_color,
          textColor: createdNode.text_color,
          isEditing: createdNode.is_editing,
          isTemporary: createdNode.is_temporary
        }
      };
      callback(newNodeWithData);
      console.log('nodeCreation: Node created with ID:', createdNode.id);

      if (parentNode) {
        const edgeId = uuidv4();
        const newEdge = {
          id: edgeId,
          source: parentNode.id,
          target: newNodeWithData.id,
          type: 'customEdge'
        };
        console.log('nodeCreation: Creating edge with data:', newEdge);
        const { data: createdEdge, error: edgeError } = await createEdge({
          source_node_id: parentNode.id,
          target_node_id: newNodeWithData.id,
          canvas_id: canvasId
        });

        if (edgeError) {
          console.error('nodeCreation: Error creating edge:', edgeError);
        } else if (createdEdge) {
          newEdge.id = createdEdge.id;
          useEdgeStore.getState().addEdge(newEdge);
          console.log('nodeCreation: Edge created with ID:', createdEdge.id);
        }
      }
    } else {
      throw new Error('nodeCreation: Node creation failed');
    }
  } catch (error) {
    console.error('nodeCreation: Error creating new node:', error);
  }
};

export const replaceNodeWithType = async (
  nodeType: Database['public']['Enums']['node_type'],
  id: string,
  position: XYPosition,
  edges: any[],
  setNode: (node: Node) => void,
  canvasId: string
) => {
  const existingEdge = edges.find(
    (edge) => edge.source === id || edge.target === id
  );

  if (existingEdge) {
    const updatedEdgeData = {
      sourceNodeId: existingEdge.source === id ? null : existingEdge.source,
      targetNodeId: existingEdge.target === id ? null : existingEdge.target,
      data: existingEdge.data
    };

    console.log('nodeCreation: Updating edge with ID:', existingEdge.id);
    const { error: edgeError } = await updateEdgeInDatabase(
      existingEdge.id,
      updatedEdgeData
    );

    if (edgeError) {
      console.error('nodeCreation: Error updating edge:', edgeError);
    }
  }
  const commonNodeProperties = {
    type: nodeType,
    position: {
      x: position.x,
      y: position.y
    },
    isEditing: false
  };

  console.log('nodeCreation: Updating node with data:', commonNodeProperties);
  const { data: updatedNode, error: updateError } = await createNodeInDatabase(
    canvasId,
    nodeType,
    {
      x: position.x,
      y: position.y
    },
    commonNodeProperties
  );

  if (updateError) {
    console.error('nodeCreation: Error updating node:', updateError);
    return;
  }

  if (updatedNode) {
    const newNode: Node = {
      id: id,
      type: nodeType,
      position: position,
      data: {
        ...getNodeSpecificProperties(nodeType, false),
        ...updatedNode
      }
    };

    console.log('nodeCreation: Node replaced with new type:', nodeType);
    setNode(newNode);
  }
};
