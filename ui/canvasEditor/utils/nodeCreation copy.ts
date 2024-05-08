import { Node, XYPosition } from 'reactflow';
import type { Json, Tables } from '@/types_db';
import { getNodeSpecificProperties, nodeDimensions } from './nodeProperties';
import { nanoid } from 'nanoid';
import { useStore } from '@/app/store/useCanvasStore';

type BaseNode = Tables<'base_nodes'>;

interface JsonPosition {
  x: number;
  y: number;
  [key: string]: Json | number | undefined;
}

const setPosition = (x: number, y: number): JsonPosition => {
  return { x, y };
};

function isPositionOccupied(
  newPosition: { x: number; y: number },
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

const isEditableNode = (
  nodeType: string
): nodeType is 'note' | 'task' | 'custom' | 'code' | 'draw' => {
  return ['note', 'task', 'custom', 'code', 'draw'].includes(
    nodeType as 'note' | 'task' | 'custom' | 'code' | 'draw'
  );
};

export const createNode = (
  nodeType: 'note' | 'task' | 'custom' | 'code' | 'draw' | 'selectionMenu',
  position: { x: number; y: number },
  existingNodes: Node<any>[],
  callback: (newNode: Node<any>) => void,
  canvasSize: { width: number; height: number },
  isTemporary = nodeType === 'selectionMenu',
  isEditing = false,
  parentNode?: Node<any> | null
) => {
  console.log('nodeCreation: Creating node:', nodeType);
  const zoomLevel = 1.0;
  position.x /= zoomLevel;
  position.y /= zoomLevel;

  const dimensions = nodeDimensions[nodeType];
  let nodeDimension: { width: number; height: number } = {
    width: dimensions.width,
    height: dimensions.height
  };

  if (isEditing && 'editWidth' in dimensions && 'editHeight' in dimensions) {
    nodeDimension = {
      width: dimensions.editWidth,
      height: dimensions.editHeight
    };
  }

  const positionAsXYPosition = setPosition(position.x, position.y);

  if (nodeType === 'selectionMenu') {
    const { removeNode, addNode, addEdge } = useStore.getState();

    // Define the node first
    const selectionMenuNode: Node<any> = {
      id: `selectionMenu-${nanoid()}`,
      type: 'selectionMenu',
      position: positionAsXYPosition,
      data: {},
      width: nodeDimension.width,
      height: nodeDimension.height
    };

    // Assign the data property after the node is defined
    selectionMenuNode.data = {
      onSelect: (selectedNodeType, selectedPosition) => {
        createNode(
          selectedNodeType,
          selectedPosition,
          useStore.getState().nodes,
          (newNode) => {
            addNode(newNode);
            addEdge({
              id: `e-${newNode.id}-${parentNode?.id}`,
              source: parentNode?.id || '',
              target: newNode.id,
              type: 'customEdge'
            });
            removeNode(selectionMenuNode.id);
          },
          canvasSize,
          false,
          false,
          parentNode
        );
      },
      onClose: () => removeNode(selectionMenuNode.id),
      position: positionAsXYPosition,
      id: selectionMenuNode.id,
      type: selectionMenuNode.type,
      parentNode: parentNode || null,
      isTemporary: isTemporary
    };

    callback(selectionMenuNode);
    return;
  }

  const baseProperties = {
    id: nanoid(),
    type: nodeType,
    position: positionAsXYPosition,
    parentNode: parentNode?.id || null
  };

  const defaultProperties = isEditableNode(nodeType)
    ? {
        isEditing: isEditing,
        isTemporary: isTemporary
      }
    : {};

  const specificNode = {
    ...baseProperties,
    ...getNodeSpecificProperties(nodeType, isEditing)
  };

  const newNode: Node<any> = {
    ...specificNode,
    id: baseProperties.id,
    type: baseProperties.type,
    position: positionAsXYPosition,
    data: isTemporary ? { isTemporary: true } : specificNode,
    width: nodeDimension.width,
    height: nodeDimension.height,
    parentNode: parentNode?.id || undefined
  };

  console.log('nodeCreation: New node:', newNode);

  callback(newNode);
};
