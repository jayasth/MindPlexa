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
  isTemporary = false,
  isEditing = false,
  parentNode?: Node<any>
) => {
  console.log('nodeCreation: Creating node:', nodeType);
  const zoomLevel = 1.0;
  position.x /= zoomLevel;
  position.y /= zoomLevel;

  const dimensions = nodeDimensions[nodeType];
  let nodeDimension: { width: number; height: number };

  if (nodeType === 'selectionMenu') {
    nodeDimension = {
      width: dimensions.width,
      height: dimensions.height
    };
  } else if (
    isEditing &&
    'editWidth' in dimensions &&
    'editHeight' in dimensions
  ) {
    nodeDimension = {
      width: dimensions.editWidth,
      height: dimensions.editHeight
    };
  } else {
    nodeDimension = {
      width: dimensions.width,
      height: dimensions.height
    };
  }

  if (!Array.isArray(existingNodes)) {
    console.error('Invalid existingNodes array');
    return;
  }

  while (isPositionOccupied(position, existingNodes, nodeDimension)) {
    position.x += Math.random() * nodeDimension.width - nodeDimension.width / 2;
    position.y +=
      Math.random() * nodeDimension.height - nodeDimension.height / 2;
  }

  if (nodeType === 'selectionMenu') {
    const positionAsXYPosition = setPosition(position.x, position.y);
    const { removeNode } = useStore.getState();
    const newNode: Node<any> = {
      id: `selectionMenu-${nanoid()}`,
      type: 'selectionMenu',
      position: positionAsXYPosition,
      data: {
        onSelect: (selectedNodeType, selectedPosition) => {
          createNode(
            selectedNodeType,
            selectedPosition,
            existingNodes,
            (newNode) => {
              const { addNode, addEdge } = useStore.getState();
              addNode(newNode);
              addEdge({
                id: `e-${nanoid()}`,
                source: parentNode?.id || '',
                target: newNode.id,
                type: 'customEdge'
              });
            },
            canvasSize,
            false,
            false,
            parentNode
          );
          removeNode(newNode.id);
        },
        onClose: () => removeNode(newNode.id),
        parentNode: parentNode || null,
        isTemporary: isTemporary
      },
      width: nodeDimensions[nodeType].width,
      height: nodeDimensions[nodeType].height
    };

    callback(newNode);
    return;
  }

  if (isEditableNode(nodeType)) {
    position.x = Math.max(
      0,
      Math.min(position.x, canvasSize.width - nodeDimension.width)
    );
    position.y = Math.max(
      0,
      Math.min(position.y, canvasSize.height - nodeDimension.height)
    );
  }

  const positionAsXYPosition = setPosition(position.x, position.y);

  const defaultProperties = {
    isEditing: isEditing,
    draggable: true,
    connectable: true,
    width: nodeDimension.width,
    height: nodeDimension.height,
    title: `Untitled ${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)}`
  };

  let baseProperties: Partial<BaseNode> & {
    id: string;
    position: XYPosition;
    type: string;
  } = {
    id: `${nodeType}-${nanoid()}`,
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
    id: baseProperties.id,
    type: baseProperties.type,
    position: positionAsXYPosition,
    data: isTemporary ? { isTemporary: true } : specificNode,
    width: nodeDimensions[nodeType].width,
    height: nodeDimensions[nodeType].height
  };

  console.log('nodeCreation: New node:', newNode);

  callback(newNode);
};
