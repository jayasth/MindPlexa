import { Node, XYPosition } from 'reactflow';
import type { Json, Tables } from '@/types_db';
import { getNodeSpecificProperties, nodeDimensions } from './nodeProperties';
import { nanoid } from 'nanoid';
import { useStore } from '@/app/store/useCanvasStore';
import { handleTemporaryNodeCreation } from '@/ui/canvasEditor/utils/TemporaryNodeHandler';

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
  position: XYPosition,
  nodes: Node<any>[],
  callback: (newNode: Node<any>) => void,
  canvasSize: { width: number; height: number },
  isTemporary = nodeType === 'selectionMenu',
  isEditing = false,
  parentNode?: Node<any> | null,
  temporaryNodeId?: string
) => {
  if (!position) {
    console.error('NodeCreation: createNode called with undefined position');
    return;
  }

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

  if (!Array.isArray(nodes)) {
    console.error('Invalid nodes array');
    return;
  }

  const positionAsXYPosition = setPosition(position.x, position.y);

  while (isPositionOccupied(position, nodes, nodeDimension)) {
    position.x += Math.random() * nodeDimension.width - nodeDimension.width / 2;
    position.y +=
      Math.random() * nodeDimension.height - nodeDimension.height / 2;
  }

  if (nodeType === 'selectionMenu') {
    if (parentNode) {
      handleTemporaryNodeCreation(parentNode, positionAsXYPosition, nodeType);
    } else {
      const newNode: Node<any> = {
        id: `selectionMenu-${nanoid()}`,
        type: nodeType,
        position: positionAsXYPosition,
        data: {
          onSelect: (selectedNodeType, selectedPosition) => {
            createNode(
              selectedNodeType,
              selectedPosition,
              nodes,
              callback,
              canvasSize,
              false,
              false,
              null
            );
          },
          onClose: () => {
            const { removeNode } = useStore.getState();
            removeNode(newNode.id);
          },
          isTemporary: true
        },
        width: nodeDimension.width,
        height: nodeDimension.height
      };

      callback(newNode);
    }
  } else {
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
      type: string;
      position: JsonPosition;
    } = {
      id: nanoid(),
      type: nodeType,
      position: positionAsXYPosition,
      ...defaultProperties
    };

    const specificNode = {
      ...baseProperties,
      ...getNodeSpecificProperties(nodeType, isEditing)
    };

    const newNode: Node<any> = {
      id: nanoid(),
      type: nodeType,
      position,
      data: {
        isTemporary: false,
        width: nodeDimensions[nodeType].width,
        height: nodeDimensions[nodeType].height
      },
      width: nodeDimensions[nodeType].width,
      height: nodeDimensions[nodeType].height
    };

    const { addNode, addEdge } = useStore.getState();
    addNode(newNode);

    if (parentNode) {
      addEdge({
        id: `e-${nanoid()}`,
        source: parentNode.id,
        target: newNode.id,
        type: 'customEdge'
      });
    }

    callback(newNode);
  }
};
