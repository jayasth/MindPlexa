import { useCallback, useRef, useState } from 'react';
import { useStore } from '@/app/store/useCanvasStore';
import { getChildNodePosition } from '@/ui/canvasEditor/utils/getChildNodePosition';
import { nanoid } from 'nanoid';
import type { XYPosition } from 'reactflow';

export const useEdgeConnection = () => {
  const {
    nodes,
    nodeInternals,
    domNode,
    screenToFlowPosition,
    addChildNode,
    addEdge
  } = useStore((state) => ({
    nodes: state.nodes,
    nodeInternals: state.nodeInternals,
    domNode: state.domNode,
    screenToFlowPosition: state.screenToFlowPosition,
    addChildNode: state.addChildNode,
    addEdge: state.addEdge
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
            addChildNode(parentNode, position, 'selectionMenu');
          }
        }
      } else if (connectingNodeId.current) {
        const sourceNode = nodeInternals.get(connectingNodeId.current);
        const targetNode = event.target.getAttribute('data-id');

        if (sourceNode && targetNode) {
          addEdge({
            id: nanoid(),
            source: sourceNode.id,
            target: targetNode,
            type: 'customEdge'
          });
        }
      }

      setParentNode(null);
      connectingNodeId.current = null;
    },
    [nodeInternals, domNode, screenToFlowPosition, addChildNode, addEdge]
  );

  return {
    onConnectStart,
    onConnectEnd,
    parentNode,
    childNodePosition
  };
};
