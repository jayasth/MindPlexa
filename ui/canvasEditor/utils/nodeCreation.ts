import { Node, XYPosition } from 'reactflow';
import {
  getNodeSpecificProperties,
  nodeDimensions
} from '@/ui/canvasEditor/utils/nodeProperties';
import { findOptimalPosition } from '@/ui/canvasEditor/utils/positioningUtils';
import {
  createNode as createNodeInDatabase,
  updateEdge as updateEdgeInDatabase,
  createEdge
} from '@/utils/canvas/nodeEdgeDatabaseOperations';
import { v4 as uuidv4 } from 'uuid';
import { Database } from '@/types_db';
import { useStore } from '@/app/store/useCanvasStore';

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
    newNode.data.is_temporary = true;
  }

  try {
    const newNodeData = {
      ...newNode.data,
      z_index: 0,
      is_temporary: isTemporary,
      parent_node_id: parentNode ? parentNode.id : null
    };

    console.log(
      'nodeCreation: Creating node in database with data:',
      newNodeData
    );
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
      const newNodeWithData: Node<any> = {
        ...newNode,
        id: createdNode.id,
        position: positionAsXYPosition,
        data: {
          ...createdNode,
          backgroundColor: createdNode.background_color || '#F4F4F4',
          textColor: createdNode.text_color || '#575757',
          isEditing: false
        }
      };
      callback(newNodeWithData);
      console.log('nodeCreation: Node created with ID:', createdNode.id);

      // Create edge if there's a parent node
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
          // Add the edge to the local state
          useStore.getState().addEdge(newEdge);
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
  nodeType: 'note' | 'task' | 'table' | 'calendar' | 'draw',
  id: string,
  position: XYPosition,
  edges: any[],
  setNode: (node: Node) => void,
  supabase: any
) => {
  const existingEdge = edges.find(
    (edge) => edge.source === id || edge.target === id
  );

  if (existingEdge) {
    const updatedEdgeData: Database['public']['Tables']['edges']['Update'] = {
      source_node_id:
        existingEdge.source === id ? null : existingEdge.source_node_id,
      target_node_id:
        existingEdge.target === id ? null : existingEdge.target_node_id,
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

  const newNodeInsertData: Database['public']['Tables']['note_nodes']['Insert'] =
    {
      content: 'New note content'
    };

  console.log('nodeCreation: Inserting new node with data:', newNodeInsertData);
  const { data: newNodeData, error: newNodeError } = await supabase
    .from(`${nodeType}_nodes`)
    .insert([newNodeInsertData])
    .select()
    .single();

  if (newNodeError) {
    console.error('nodeCreation: Error inserting new node:', newNodeError);
    return;
  }

  const updatedNode: Node = {
    id: id,
    type: nodeType,
    position: {
      x: position.x,
      y: position.y
    },
    data: {
      ...getNodeSpecificProperties(nodeType, false),
      ...newNodeData
    }
  };

  console.log('nodeCreation: Node replaced with new type:', nodeType);
  setNode(updatedNode);
};
