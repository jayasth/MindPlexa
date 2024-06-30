import { useCallback, useRef, useState } from 'react';
import { useStore } from '@/app/store/useCanvasStore';
import { getChildNodePosition } from '@/ui/canvasEditor/utils/getChildNodePosition';
import { handleTemporaryNodeCreation } from '@/ui/canvasEditor/utils/TemporaryNodeHandler';
import type { XYPosition } from 'reactflow';
import { v4 as uuidv4 } from 'uuid';

export const useEdgeConnection = () => {
  const {
    nodeInternals,
    domNode,
    screenToFlowPosition,
    addChildNode,
    addEdge,
    addNode,
    removeNode,
    nodes
  } = useStore((state) => ({
    nodes: state.nodes,
    nodeInternals: state.nodeInternals,
    domNode: state.domNode,
    screenToFlowPosition: state.screenToFlowPosition,
    addChildNode: state.addChildNode,
    addEdge: state.addEdge,
    addNode: state.addNode,
    removeNode: state.removeNode
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
          console.log('onConnectEnd: position:', position);

          if (position) {
            handleTemporaryNodeCreation(
              parentNode,
              position,
              'selectionMenu',
              (newNode) => {
                console.log('useEdgeConnection: Node created:', newNode);
                addNode(newNode);
              },
              addEdge,
              removeNode,
              nodes,
              useStore.getState().canvasID
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
      removeNode,
      nodes
    ]
  );
  return {
    onConnectStart,
    onConnectEnd,
    parentNode,
    childNodePosition
  };
};
