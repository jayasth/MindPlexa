import { useCallback, useRef, useState } from 'react';
import { useStore } from '@/app/store/useCanvasStore';
import { createNode } from '@/ui/canvasEditor/utils/nodeCreation';
import { getChildNodePosition } from '@/ui/canvasEditor/utils/getChildNodePosition';
import { nanoid } from 'nanoid';
import { nodeDimensions } from '@/ui/canvasEditor/utils/nodeProperties';
import type { XYPosition } from 'reactflow';

export const useEdgeConnection = () => {
  const {
    nodes,
    addEdge,
    nodeInternals,
    addNode,
    domNode,
    screenToFlowPosition
  } = useStore((state) => ({
    nodes: state.nodes,
    addEdge: state.addEdge,
    nodeInternals: state.nodeInternals,
    addNode: state.addNode,
    domNode: state.domNode,
    screenToFlowPosition: state.screenToFlowPosition
  }));

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

      if (targetIsPane && connectingNodeId.current) {
        const parentNode = nodeInternals.get(connectingNodeId.current);

        if (parentNode && domNode) {
          const position = getChildNodePosition(
            event,
            parentNode,
            domNode,
            screenToFlowPosition
          );
          setChildNodePosition(position);

          if (position) {
            createNode(
              'selectionMenu',
              position,
              nodes,
              (newNode) => {
                addNode(newNode);
                addEdge({
                  id: `e-${nanoid()}`,
                  source: parentNode.id,
                  target: newNode.id,
                  type: 'customEdge'
                });
              },
              {
                width: nodeDimensions['selectionMenu'].width,
                height: nodeDimensions['selectionMenu'].height
              },
              true,
              false,
              parentNode
            );
          }
        }
      }
    },
    [addEdge, nodeInternals, nodes, addNode, domNode, screenToFlowPosition]
  );

  return {
    onConnectStart,
    onConnectEnd,
    parentNode,
    childNodePosition
  };
};
