import { v4 as uuidv4 } from 'uuid';
import { Node, Edge, XYPosition } from 'reactflow';
import { createNode } from './nodeCreation';
import { nodeDimensions } from './nodeProperties';
import { createEdge } from '@/utils/canvas/nodeEdgeDatabaseOperations';

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

  const temporaryNodeId = uuidv4();

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
            async (newNode) => {
              addNode(newNode);
              if (parentNode) {
                const { data: createdEdge, error: edgeError } =
                  await createEdge({
                    source_node_id: parentNode.id,
                    target_node_id: newNode.id,
                    canvas_id: canvasId
                  });

                if (edgeError) {
                  console.error('Error creating edge:', edgeError);
                } else if (createdEdge) {
                  const newEdge = {
                    id: createdEdge.id,
                    source: parentNode.id,
                    target: newNode.id,
                    type: 'customEdge'
                  };
                  addEdge(newEdge);
                }
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

  await createNode(
    'selectionMenu',
    position,
    nodes,
    addNode,
    {
      width: nodeDimensions['selectionMenu'].width,
      height: nodeDimensions['selectionMenu'].height
    },
    true,
    false,
    canvasId,
    parentNode,
    temporaryNodeId
  );

  if (parentNode) {
    const { data: createdEdge, error: edgeError } = await createEdge({
      source_node_id: parentNode.id,
      target_node_id: temporaryNodeId,
      canvas_id: canvasId
    });

    if (edgeError) {
      console.error('Error creating edge:', edgeError);
    } else if (createdEdge) {
      const newEdge = {
        id: createdEdge.id,
        source: parentNode.id,
        target: temporaryNodeId,
        type: 'customEdge'
      };
      addEdge(newEdge);
    }
  }
  console.log('Finished handleTemporaryNodeCreation');
};
