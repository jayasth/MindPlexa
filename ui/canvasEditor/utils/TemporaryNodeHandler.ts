import { nanoid } from 'nanoid';
import { Node, XYPosition } from 'reactflow';
import { useStore } from '@/app/store/useCanvasStore';
import { createNode } from './nodeCreation';
import { nodeDimensions } from './nodeProperties';

export const handleTemporaryNodeCreation = (
  parentNode: Node | null,
  position: XYPosition,
  nodeType: 'note' | 'task' | 'custom' | 'code' | 'draw' | 'selectionMenu'
) => {
  const { addNode, addEdge, removeNode, nodes } = useStore.getState();

  const temporaryNodeId = `selectionMenu-${nanoid()}`;
  const temporaryNode: Node = {
    id: temporaryNodeId,
    type: 'selectionMenu',
    position,
    data: {
      onSelect: (selectedNodeType, selectedPosition) => {
        createNode(
          selectedNodeType,
          selectedPosition,
          nodes,
          (newNode) => {
            addNode(newNode);
            if (parentNode) {
              addEdge({
                id: `e-${nanoid()}`,
                source: parentNode.id,
                target: newNode.id,
                type: 'customEdge'
              });
            }
            removeNode(temporaryNodeId);
          },
          { width: 0, height: 0 },
          false,
          false,
          parentNode
        );
      },
      onClose: () => removeNode(temporaryNodeId),
      parentNode,
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
};
