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
import { createEdgeBetweenNodes } from '@/utils/canvas/edgeService';
import { v4 as uuidv4 } from 'uuid';
import useEdgeStore from '@/app/store/edges/useEdgeStore';
import * as nodeSpecificDataService from '@/utils/canvas/nodeSpecificDataService';

const setPosition = (x: number, y: number): XYPosition => ({ x, y });

function findNewPosition(
  nodes: Node<any>[],
  canvasSize: { width: number; height: number }
): XYPosition {
  return findOptimalPosition(nodes, canvasSize);
}

const createEdge = async (
  parentNodeId: string,
  newNodeId: string,
  canvasId: string
) => {
  const edgeId = uuidv4();
  const newEdge = {
    id: edgeId,
    source: parentNodeId,
    target: newNodeId,
    type: 'customEdge'
  };
  console.log('nodeCreation: Creating edge with data:', newEdge);
  const { data: createdEdge, error: edgeError } = await createEdgeBetweenNodes({
    sourceNodeId: parentNodeId,
    targetNodeId: newNodeId,
    canvasId
  });

  if (edgeError) {
    console.error('nodeCreation: Error creating edge:', edgeError);
  } else if (createdEdge) {
    useEdgeStore.getState().addEdge(newEdge);
    console.log('nodeCreation: Edge created with ID:', createdEdge.id);
  }
};

export const createNode = async (
  nodeType: 'note' | 'task' | 'table' | 'calendar' | 'draw' | 'selection_menu',
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

  const positionAsXYPosition =
    nodeType === 'selection_menu'
      ? position
      : findNewPosition(nodes, canvasSize);

  const defaultProperties = {
    backgroundColor: '#F4F4F4',
    textColor: '#575757'
  };

  const defaultTitle = `Untitled ${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)}`;

  const newNodeData = {
    id: nodeId,
    type: nodeType,
    position: JSON.stringify(positionAsXYPosition),
    backgroundColor: defaultProperties.backgroundColor,
    textColor: defaultProperties.textColor,
    isEditing: isEditing,
    isTemporary: isTemporary,
    parentNodeId: parentNode ? parentNode.id : null,
    zIndex: 0,
    title: defaultTitle,
    viewWidth:
      'width' in nodeDimension ? nodeDimension.width : nodeDimension.viewWidth,
    viewHeight:
      'height' in nodeDimension
        ? nodeDimension.height
        : nodeDimension.viewHeight,
    editWidth: 'editWidth' in nodeDimension ? nodeDimension.editWidth : null,
    editHeight: 'editHeight' in nodeDimension ? nodeDimension.editHeight : null,
    mobileEditWidth:
      'mobileEditWidth' in nodeDimension ? nodeDimension.mobileEditWidth : null,
    mobileEditHeight:
      'mobileEditHeight' in nodeDimension
        ? nodeDimension.mobileEditHeight
        : null
  };

  if (nodeType === 'selection_menu') {
    newNodeData.viewWidth = nodeDimensions.selection_menu.width;
    newNodeData.viewHeight = nodeDimensions.selection_menu.height;
  }

  try {
    const { data: createdNode, error } = await createNodeInDatabase(
      canvasId,
      nodeType,
      positionAsXYPosition,
      {
        ...newNodeData,
        type: nodeType
      }
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
          backgroundColor: createdNode.backgroundColor,
          textColor: createdNode.textColor,
          isTemporary: createdNode.isTemporary,
          ...getNodeSpecificProperties(nodeType, isEditing)
        }
      };
      callback(newNode);
      if (parentNode && nodeType !== 'selection_menu') {
        await createEdge(parentNode.id, newNode.id, canvasId);
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
  console.log('Starting handleTemporaryNodeCreation with position:', position);

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
              if (parentNode) {
                await createEdge(parentNode.id, newNode.id, canvasId);
              }
            },
            {
              width: nodeDimensions['selection_menu'].width,
              height: nodeDimensions['selection_menu'].height
            },
            false,
            false,
            canvasId,
            parentNode
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
    async (newNode) => {
      addNode(newNode, canvasId);
      console.log('TemporaryNodeHandler: Node added:', newNode);

      if (parentNode) {
        const newEdge = {
          id: uuidv4(),
          source: parentNode.id,
          target: newNode.id,
          type: 'customEdge'
        };
        useEdgeStore.getState().addEdge(newEdge);
        const { data: createdEdge, error } = await createEdgeBetweenNodes({
          sourceNodeId: parentNode.id,
          targetNodeId: newNode.id,
          canvasId
        });
        if (error) {
          console.error('Failed to create edge in database:', error);
        } else {
          console.log('Edge created successfully in database:', createdEdge);
        }
      }
    },
    {
      width: nodeDimensions['selection_menu'].width,
      height: nodeDimensions['selection_menu'].height
    },
    true,
    false,
    canvasId,
    parentNode
  );

  console.log('Finished handleTemporaryNodeCreation');
};

export const replaceNodeWithType = async (
  nodeType: 'note' | 'task' | 'table' | 'calendar' | 'draw',
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
    isEditing: false,
    isTemporary: false,
    viewWidth: nodeDimension.viewWidth,
    viewHeight: nodeDimension.viewHeight,
    editWidth: nodeDimension.editWidth,
    editHeight: nodeDimension.editHeight,
    mobileEditWidth: nodeDimension.mobileEditWidth,
    mobileEditHeight: nodeDimension.mobileEditHeight
  };

  console.log('nodeCreation: Replacing node with data:', newNodeData);
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
    // Create node-specific data
    const specificDataInsert = {};
    const { data: specificData, error: specificError } =
      await nodeSpecificDataService.createNodeSpecificData(
        id,
        nodeType,
        specificDataInsert
      );

    if (specificError) {
      console.error(
        'nodeCreation: Error creating node-specific data:',
        specificError
      );
      return;
    }

    const newNode: Node = {
      id: id,
      type: nodeType,
      position: position,
      data: {
        ...updatedNode,
        backgroundColor: updatedNode.backgroundColor,
        textColor: updatedNode.textColor,
        isTemporary: updatedNode.isTemporary,
        ...getNodeSpecificProperties(nodeType, false),
        ...specificData
      }
    };

    console.log('nodeCreation: Node replaced with new type:', nodeType);
    setNode(newNode);
  }
};
