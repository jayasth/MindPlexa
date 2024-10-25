import { Node, XYPosition, Edge } from 'reactflow';
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
import { useNodeStore } from '@/app/store';
import { createClient } from '@/utils/supabase/supabaseClient';
const supabase = createClient();

function findNewPosition(
  nodes: Node[],
  canvasSize: { width: number; height: number }
): XYPosition {
  return findOptimalPosition(nodes, canvasSize);
}

const createEdge = async (
  parentNodeId: string,
  newNodeId: string,
  canvasId: string
) => {
  const { data: createdEdge, error: edgeError } = await createEdgeBetweenNodes({
    sourceNodeId: parentNodeId,
    targetNodeId: newNodeId,
    canvasId
  });

  if (edgeError) {
    console.error('nodeCreation: Error creating edge:', edgeError);
  } else if (createdEdge) {
    const newEdge = {
      id: createdEdge.id,
      source: parentNodeId,
      target: newNodeId,
      type: 'customEdge'
    };
    useEdgeStore.getState().addEdge(newEdge);
    console.log('nodeCreation: Edge created with ID:', createdEdge.id);
  }
};

export const createNode = async (
  nodeType: 'note' | 'task' | 'table' | 'calendar' | 'draw' | 'selection_menu',
  position: XYPosition,
  nodes: Node[],
  callback: (newNode: Node) => void,
  canvasSize: { width: number; height: number },
  isTemporary = nodeType === 'selection_menu',
  isEditing = false,
  canvasId: string,
  parentNode?: Node | null,
  temporaryNodeId?: string
): Promise<void> => {
  const nodeId = temporaryNodeId || uuidv4();
  const nodeDimension = nodeDimensions[nodeType];

  // Initialize drawing-specific data if it's a draw node
  let drawingFileUrl: string | undefined;
  if (nodeType === 'draw') {
    try {
      // Create an empty SVG
      const emptyDrawing = '<svg xmlns="http://www.w3.org/2000/svg"></svg>';
      const blob = new Blob([emptyDrawing], { type: 'image/svg+xml' });

      // Upload to storage
      await supabase.storage.from('drawings').upload(`${nodeId}.svg`, blob, {
        contentType: 'image/svg+xml',
        upsert: true
      });

      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('drawings')
        .getPublicUrl(`${nodeId}.svg`);

      drawingFileUrl = publicUrlData.publicUrl;
    } catch (error) {
      console.error('Error initializing drawing:', error);
    }
  }

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
        : null,
    drawingFileUrl: nodeType === 'draw' ? drawingFileUrl : undefined
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
      // For draw nodes, initialize node-specific data
      if (nodeType === 'draw') {
        await nodeSpecificDataService.createNodeSpecificData(nodeId, 'draw', {
          drawing_file_url: drawingFileUrl,
          current_tool: 'Pen',
          current_color: '#000000',
          current_stroke_width: 2,
          settings: [
            { name: 'Pen', color: '#000000', strokeWidth: 2, opacity: 100 }
            // Add other default tool settings as needed
          ]
        });
      }

      const newNode: Node = {
        id: nodeId,
        type: nodeType,
        position: positionAsXYPosition,
        data: {
          ...createdNode,
          backgroundColor: createdNode.backgroundColor,
          textColor: createdNode.textColor,
          isTemporary: createdNode.isTemporary,
          drawingFileUrl,
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

  await createNode(
    'selection_menu',
    position,
    nodes,
    async (newNode) => {
      addNode(newNode, canvasId);
      console.log('TemporaryNodeHandler: Node added:', newNode);

      if (parentNode) {
        const { data: createdEdge, error } = await createEdgeBetweenNodes({
          sourceNodeId: parentNode.id,
          targetNodeId: newNode.id,
          canvasId
        });
        if (error) {
          console.error('Failed to create edge in database:', error);
        } else if (createdEdge) {
          const newEdge = {
            id: createdEdge.id,
            source: parentNode.id,
            target: newNode.id,
            type: 'customEdge'
          };
          useEdgeStore.getState().addEdge(newEdge);
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
    parentNode,
    temporaryNodeId
  );

  console.log('Finished handleTemporaryNodeCreation');
};

export const replaceNodeWithType = async (
  nodeType: 'note' | 'task' | 'table' | 'calendar' | 'draw',
  id: string,
  position: XYPosition,
  edges: Edge[],
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
    mobileEditHeight: nodeDimension.mobileEditHeight,
    backgroundColor: '#F4F4F4',
    textColor: '#575757',
    zIndex: 0,
    title: `Untitled ${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)}`
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
        ...(specificData as Record<string, unknown>)
      }
    };

    console.log('nodeCreation: Node replaced with new type:', nodeType);
    setNode(newNode);

    // Force re-render by updating the state
    setTimeout(() => {
      setNode({ ...newNode, data: { ...newNode.data, isEditing: true } });
      setTimeout(() => {
        setNode({ ...newNode, data: { ...newNode.data, isEditing: false } });
      }, 0);
    }, 0);

    // Update the node store to ensure state consistency
    const updateNodeInStore = useNodeStore.getState().updateNode;
    updateNodeInStore(newNode.id, newNode, canvasId);
  }
};
