import { v4 as uuidv4 } from 'uuid';
import { Node, XYPosition } from 'reactflow';
import { createNode } from './nodeCreation';
import { nodeDimensions } from './nodeProperties';

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
              if (parentNode) {
                // Edge creation logic removed as per instructions
              }
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
