import { useCallback, useRef, useState } from 'react';
import {
  useNodeStore,
  useEdgeStore,
  useUIStore,
  useCanvasStore
} from '@/app/store';
import { getChildNodePosition } from '@/ui/canvasEditor/utils/getChildNodePosition';
import { createNode } from '@/ui/canvasEditor/utils/nodeCreation';
import { nodeDimensions } from '@/ui/canvasEditor/utils/nodeProperties';
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
            createNode(
              'selection_menu',
              position,
              nodes,
              (newNode) => {
                console.log('useEdgeConnection: Node created:', newNode);
                addNode(newNode, canvasID);
                if (parentNode) {
                  const newEdge = {
                    id: uuidv4(),
                    source: parentNode.id,
                    target: newNode.id,
                    type: 'customEdge'
                  };
                  addEdge(newEdge);
                  console.log('useEdgeConnection: Edge created:', newEdge);
                }
              },
              {
                width: nodeDimensions['selection_menu'].width,
                height: nodeDimensions['selection_menu'].height
              },
              true,
              false,
              canvasID,
              parentNode
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
            target: targetNode.id,
            type: 'customEdge'
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
