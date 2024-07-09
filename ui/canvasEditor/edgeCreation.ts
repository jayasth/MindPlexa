import { useCallback, useRef, useState } from 'react';
import {
  useNodeStore,
  useEdgeStore,
  useUIStore,
  useCanvasStore
} from '@/app/store';
import { getChildNodePosition } from '@/ui/canvasEditor/utils/getChildNodePosition';
import { handleTemporaryNodeCreation } from '@/ui/canvasEditor/utils/nodeCreation';
import { createEdge } from '@/utils/canvas/edgeService';

import type { XYPosition } from 'reactflow';
import { v4 as uuidv4 } from 'uuid';

export const useEdgeConnection = () => {
  const { nodes, nodeInternals, addNode, removeNode, addChildNode } =
    useNodeStore();

  const { addEdge, removeEdge, updateEdge } = useEdgeStore();

  const { domNode, screenToFlowPosition } = useUIStore();

  const { canvasId } = useCanvasStore();

  const connectingNodeId = useRef<string | null>(null);
  const [parentNode, setParentNode] = useState(null);
  const [childNodePosition, setChildNodePosition] = useState<XYPosition | null>(
    null
  );

  const onConnectStart = useCallback((event, node) => {
    connectingNodeId.current = node.nodeId || '';
    setParentNode(node);
  }, []);

  const onConnectEnd = useCallback(
    async (event) => {
      const targetIsPane = (event.target as Element).classList.contains(
        'react-flow__pane'
      );

      console.log('onConnectEnd: targetIsPane:', targetIsPane);

      if (targetIsPane && connectingNodeId.current) {
        const parentNode = nodeInternals.get(connectingNodeId.current);
        console.log('onConnectEnd: parentNode:', parentNode);

        if (parentNode && domNode) {
          const position = getChildNodePosition(
            event,
            parentNode,
            domNode,
            screenToFlowPosition
          );
          console.log('onConnectEnd: Calculated position:', position);

          if (position.x === -1 && position.y === -1) {
            console.error('Failed to calculate valid position');
            return;
          }

          if (position) {
            const temporaryNodeId = uuidv4();

            handleTemporaryNodeCreation(
              parentNode,
              position,
              'selectionMenu',
              (node, canvasId) => {
                addNode(node, canvasId);
                // Create the edge after the temporary node is added
                const newEdge = {
                  id: uuidv4(),
                  source: parentNode.id,
                  target: node.id,
                  type: 'customEdge',
                  data: { canvasId }
                };
                addEdge(newEdge);
                createEdge({
                  sourceNodeId: parentNode.id,
                  targetNodeId: node.id,
                  canvasId
                });
              },
              (id) => removeNode(id, canvasId),
              nodes,
              canvasId
            );
          }
        }
      } else if (connectingNodeId.current) {
        const sourceNode = nodeInternals.get(connectingNodeId.current);
        const targetNode = event.target.getAttribute('data-id');

        if (sourceNode && targetNode) {
          const newEdge = {
            id: uuidv4(),
            source: sourceNode.id,
            target: targetNode,
            type: 'customEdge',
            data: { canvasId }
          };

          console.log('onConnectEnd: Adding new edge between nodes:', newEdge);
          addEdge(newEdge);

          try {
            const { data: createdEdge, error } = await createEdge({
              sourceNodeId: sourceNode.id,
              targetNodeId: targetNode,
              canvasId
            });

            if (error || !createdEdge) {
              console.error(
                'onConnectEnd: Error creating edge in database:',
                error
              );
              // Remove the edge from the store if there was an error
              removeEdge(newEdge.id);
            } else {
              console.log(
                'onConnectEnd: Edge created successfully in database',
                createdEdge
              );
              // Update the edge in the store with the ID from the database
              updateEdge(newEdge.id, { id: createdEdge.id });
            }
          } catch (error) {
            console.error(
              'onConnectEnd: Unexpected error creating edge in database:',
              error
            );
            // Remove the edge from the store if there was an error
            removeEdge(newEdge.id);
          }
        }
      }
      setParentNode(null);
      connectingNodeId.current = null;
    },
    [
      nodeInternals,
      domNode,
      screenToFlowPosition,
      addNode,
      addEdge,
      removeEdge,
      updateEdge,
      removeNode,
      nodes,
      canvasId
    ]
  );

  return {
    onConnectStart,
    onConnectEnd,
    parentNode,
    childNodePosition
  };
};
