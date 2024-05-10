import { nanoid } from 'nanoid';
import { Node, Edge, XYPosition } from 'reactflow';
import { createNode } from './nodeCreation';
import { nodeDimensions } from './nodeProperties';

export const handleTemporaryNodeCreation = (
  parentNode: Node | null,
  position: XYPosition,
  nodeType: 'selectionMenu',
  addNode: (node: Node) => void,
  addEdge: (edge: Edge) => void,
  removeNode: (id: string) => void,
  nodes: Node[]
) => {
  console.log('Starting handleTemporaryNodeCreation');

  const temporaryNodeId = `selectionMenu-${nanoid()}`;

  const temporaryNode: Node = {
    id: temporaryNodeId,
    type: nodeType,
    position,
    data: {
      onSelect: (selectedNodeType, selectedPosition) => {
        removeNode(temporaryNodeId);
        setTimeout(() => {
          createNode(
            selectedNodeType,
            selectedPosition,
            nodes.filter((n) => n.id !== temporaryNodeId),
            (newNode) => {
              addNode(newNode);
              if (parentNode) {
                addEdge({
                  id: `e-${temporaryNodeId}-${parentNode.id}`,
                  source: parentNode.id,
                  target: newNode.id,
                  type: 'customEdge'
                });
              }
            },
            { width: 0, height: 0 },
            false,
            false,
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

  addNode(temporaryNode);

  if (parentNode) {
    addEdge({
      id: `e-${temporaryNodeId}-${parentNode.id}`,
      source: parentNode.id,
      target: temporaryNodeId,
      type: 'customEdge'
    });
  }
  console.log('Finished handleTemporaryNodeCreation');
};
