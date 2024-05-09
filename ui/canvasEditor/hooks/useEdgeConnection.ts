import { useCallback, useRef, useState } from 'react';
import { useStore } from '@/app/store/useCanvasStore';
import { getChildNodePosition } from '@/ui/canvasEditor/utils/getChildNodePosition';
import { handleTemporaryNodeCreation } from '@/ui/canvasEditor/utils/TemporaryNodeHandler';
import type { XYPosition } from 'reactflow';

export const useEdgeConnection = () => {
  const { nodes, nodeInternals, domNode, screenToFlowPosition } = useStore(
    (state) => ({
      nodes: state.nodes,
      nodeInternals: state.nodeInternals,
      domNode: state.domNode,
      screenToFlowPosition: state.screenToFlowPosition
    })
  );

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
            handleTemporaryNodeCreation(parentNode, position, 'selectionMenu');
          }
        }
      }
    },
    [nodeInternals, domNode, screenToFlowPosition]
  );

  return {
    onConnectStart,
    onConnectEnd,
    parentNode,
    childNodePosition
  };
};
