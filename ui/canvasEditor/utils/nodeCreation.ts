import { Node, XYPosition } from 'reactflow';
import {
  getNodeSpecificProperties,
  nodeDimensions
} from '@/ui/canvasEditor/utils/nodeProperties';
import { findOptimalPosition } from '@/ui/canvasEditor/utils/positioningUtils';
import {
  createNode as createNodeInDatabase,
  updateNode as updateNodeInDatabase
} from '@/utils/canvas/nodeService';
import { createEdge } from '@/utils/canvas/edgeService';
import { v4 as uuidv4 } from 'uuid';
import { Database } from '@/types_db';
import useEdgeStore from '@/app/store/edges/useEdgeStore';

const setPosition = (x: number, y: number): XYPosition => ({ x, y });

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
  const positionAsXYPosition = findNewPosition(nodes, canvasSize);

  const defaultProperties = {
    backgroundColor: '#F4F4F4',
    textColor: '#575757'
  };

  const newNodeData = {
    id: nodeId,
    type: nodeType,
    position: JSON.stringify(positionAsXYPosition),
    background_color: defaultProperties.backgroundColor,
    text_color: defaultProperties.textColor,
    is_editing: isEditing,
    is_temporary: isTemporary,
    parent_node_id: parentNode ? parentNode.id : null,
    z_index: 0,
    view_width:
      'width' in nodeDimension ? nodeDimension.width : nodeDimension.viewWidth,
    view_height:
      'height' in nodeDimension
        ? nodeDimension.height
        : nodeDimension.viewHeight,
    edit_width: 'editWidth' in nodeDimension ? nodeDimension.editWidth : null,
    edit_height:
      'editHeight' in nodeDimension ? nodeDimension.editHeight : null,
    mobile_edit_width:
      'mobileEditWidth' in nodeDimension ? nodeDimension.mobileEditWidth : null,
    mobile_edit_height:
      'mobileEditHeight' in nodeDimension
        ? nodeDimension.mobileEditHeight
        : null
  };

  if (nodeType === 'selection_menu') {
    newNodeData.view_width = nodeDimensions.selection_menu.width;
    newNodeData.view_height = nodeDimensions.selection_menu.height;
  }

  try {
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
      console.log('nodeCreation: Node created with data:', createdNode);
      const newNode: Node<any> = {
        id: nodeId,
        type: nodeType,
        position: positionAsXYPosition,
        data: {
          ...createdNode,
          backgroundColor: createdNode.background_color,
          textColor: createdNode.text_color,
          isTemporary: createdNode.is_temporary,
          ...getNodeSpecificProperties(nodeType, isEditing)
        }
      };
      callback(newNode);
      if (parentNode) {
        const edgeId = uuidv4();
        const newEdge = {
          id: edgeId,
          source: parentNode.id,
          target: newNode.id,
          type: 'customEdge'
        };
        console.log('nodeCreation: Creating edge with data:', newEdge);
        const { data: createdEdge, error: edgeError } = await createEdge({
          source_node_id: parentNode.id,
          target_node_id: newNode.id,
          canvas_id: canvasId
        });

        if (edgeError) {
          console.error('nodeCreation: Error creating edge:', edgeError);
        } else if (createdEdge) {
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

export const handleTemporaryNodeCreation = async (
  parentNode: Node | null,
  position: XYPosition,
  nodeType: 'selection_menu',
  addNode: (node: Node, canvasId: string) => void,
  removeNode: (id: string) => void,
  nodes: Node[],
  canvasId: string
) => {
  console.log('Starting handleTemporaryNodeCreation');

  const temporaryNodeId = uuidv4();

  const temporaryNode: Node = {
    id: temporaryNodeId,
    type: nodeType,
    position,
    data: {
      onSelect: async (
        selectedNodeType:
          | 'selection_menu'
          | 'note'
          | 'task'
          | 'table'
          | 'calendar'
          | 'draw',
        selectedPosition
      ) => {
        removeNode(temporaryNodeId);
        setTimeout(async () => {
          await createNode(
            selectedNodeType,
            selectedPosition,
            nodes.filter((n) => n.id !== temporaryNodeId),
            async (newNode) => {
              addNode(newNode, canvasId);
              console.log('TemporaryNodeHandler: Node added:', newNode);
            },
            {
              width: nodeDimensions['selection_menu'].width,
              height: nodeDimensions['selection_menu'].height
            },
            true,
            false,
            canvasId,
            parentNode ? parentNode : undefined
          );
        }, 0);
      },
      onClose: () => {
        removeNode(temporaryNodeId);
      },
      parentNode: parentNode,
      isTemporary: true
    },
    width: nodeDimensions['selection_menu'].width,
    height: nodeDimensions['selection_menu'].height
  };

  console.log(
    'TemporaryNodeHandler: Node dimensions: ',
    nodeDimensions['selection_menu']
  );

  await createNode(
    'selection_menu',
    position,
    nodes,
    (newNode) => {
      addNode(newNode, canvasId);
      console.log('TemporaryNodeHandler: Node added:', newNode);
    },
    {
      width: nodeDimensions['selection_menu'].width,
      height: nodeDimensions['selection_menu'].height
    },
    true,
    false,
    canvasId,
    parentNode ? parentNode : undefined
  );

  console.log('Finished handleTemporaryNodeCreation');
};

export const replaceNodeWithType = async (
  nodeType: Database['public']['Enums']['node_type'],
  id: string,
  position: XYPosition,
  edges: any[],
  setNode: (node: Node) => void,
  canvasId: string
) => {
  const nodeDimension = nodeDimensions[nodeType];
  const newNodeData = {
    type: nodeType,
    position: JSON.stringify(position),
    is_editing: false,
    is_temporary: false,
    view_width:
      'viewWidth' in nodeDimension
        ? nodeDimension.viewWidth
        : nodeDimension.width,
    view_height:
      'viewHeight' in nodeDimension
        ? nodeDimension.viewHeight
        : nodeDimension.height,
    edit_width: 'editWidth' in nodeDimension ? nodeDimension.editWidth : null,
    edit_height:
      'editHeight' in nodeDimension ? nodeDimension.editHeight : null,
    mobile_edit_width:
      'mobileEditWidth' in nodeDimension ? nodeDimension.mobileEditWidth : null,
    mobile_edit_height:
      'mobileEditHeight' in nodeDimension
        ? nodeDimension.mobileEditHeight
        : null
  };

  console.log('nodeCreation: Updating node with data:', newNodeData);
  const { data: updatedNode, error: updateError } = await updateNodeInDatabase(
    id,
    newNodeData,
    {},
    nodeType
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
        ...updatedNode,
        ...getNodeSpecificProperties(nodeType, false)
      }
    };

    console.log('nodeCreation: Node replaced with new type:', nodeType);
    setNode(newNode);
  }
};
