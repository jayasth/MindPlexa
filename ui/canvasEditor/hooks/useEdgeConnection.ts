import { useCallback, useRef, useState } from 'react';
import {
  useNodeStore,
  useEdgeStore,
  useUIStore,
  useCanvasStore
} from '@/app/store';
import { getChildNodePosition } from '@/ui/canvasEditor/utils/getChildNodePosition';
import { handleTemporaryNodeCreation } from '@/ui/canvasEditor/utils/nodeCreation';

import type { XYPosition } from 'reactflow';
import { v4 as uuidv4 } from 'uuid';

export const useEdgeConnection = () => {
  const { nodes, nodeInternals, addNode, removeNode, addChildNode } =
    useNodeStore();

  const { addEdge } = useEdgeStore();

  const { domNode, screenToFlowPosition } = useUIStore();

  const { canvasID } = useCanvasStore();

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
    (event) => {
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
            handleTemporaryNodeCreation(
              parentNode,
              position,
              'selection_menu',
              addNode,
              (id) => removeNode(id, canvasID),
              nodes,
              canvasID
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
            data: { canvasId: canvasID }
          };

          console.log('onConnectEnd: Adding new edge between nodes:', newEdge);
          addEdge(newEdge);
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
      removeNode,
      nodes,
      canvasID
    ]
  );

  return {
    onConnectStart,
    onConnectEnd,
    parentNode,
    childNodePosition
  };
};
