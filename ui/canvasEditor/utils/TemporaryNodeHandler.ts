import { v4 as uuidv4 } from 'uuid';
import { Node, Edge, XYPosition } from 'reactflow';
import { createNode } from './nodeCreation';
import { nodeDimensions } from './nodeProperties';

export const handleTemporaryNodeCreation = async (
  parentNode: Node | null,
  position: XYPosition,
  nodeType: 'selectionMenu',
  addNode: (node: Node) => void,
  addEdge: (edge: Edge) => void,
  removeNode: (id: string) => void,
  nodes: Node[],
  canvasId: string
) => {
  console.log('Starting handleTemporaryNodeCreation');

  const temporaryNodeId = `selectionMenu-${uuidv4()}`;

  const temporaryNode: Node = {
    id: temporaryNodeId,
    type: nodeType,
    position,
    data: {
      onSelect: async (selectedNodeType, selectedPosition) => {
        removeNode(temporaryNodeId);
        setTimeout(async () => {
          await createNode(
            selectedNodeType,
            selectedPosition,
            nodes.filter((n) => n.id !== temporaryNodeId),
            (newNode) => {
              addNode(newNode);
              if (parentNode) {
                const edgeId = `e-${uuidv4()}`;
                addEdge({
                  id: edgeId,
                  source: parentNode.id,
                  target: newNode.id,
                  type: 'customEdge'
                });
              }
            },
            {
              width: nodeDimensions['selectionMenu'].width,
              height: nodeDimensions['selectionMenu'].height
            },
            true,
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
    width: nodeDimensions['selectionMenu'].width,
    height: nodeDimensions['selectionMenu'].height
  };

  console.log(
    'TemporaryNodeHandler: Node dimensions: ',
    nodeDimensions['selectionMenu']
  );

  addNode(temporaryNode);

  if (parentNode) {
    const edgeId = `e-${uuidv4()}`;
    addEdge({
      id: edgeId,
      source: parentNode.id,
      target: temporaryNodeId,
      type: 'customEdge'
    });
  }
  console.log('Finished handleTemporaryNodeCreation');
};
