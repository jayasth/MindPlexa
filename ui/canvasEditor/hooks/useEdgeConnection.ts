import { useCallback, useRef, useState } from 'react';
import { useStore } from '@/app/store/useCanvasStore';
import { getChildNodePosition } from '@/ui/canvasEditor/utils/getChildNodePosition';
import { nanoid } from 'nanoid';
import type { XYPosition } from 'reactflow';
import { nodeDimensions } from '@/ui/canvasEditor/utils/nodeProperties';

export const useEdgeConnection = () => {
  const {
    nodeInternals,
    domNode,
    screenToFlowPosition,
    addChildNode,
    addEdge,
    addNode
  } = useStore((state) => ({
    nodes: state.nodes,
    nodeInternals: state.nodeInternals,
    domNode: state.domNode,
    screenToFlowPosition: state.screenToFlowPosition,
    addChildNode: state.addChildNode,
    addEdge: state.addEdge,
    addNode: state.addNode
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
            const tempNodeId = nanoid();
            const tempNode = {
              id: tempNodeId,
              type: 'selectionMenu',
              position,
              data: {
                parentNode: parentNode // Add the parent node information
              },
              width: nodeDimensions['selectionMenu'].width,
              height: nodeDimensions['selectionMenu'].height
            };

            addNode(tempNode);

            const newEdge = {
              id: nanoid(),
              source: parentNode.id,
              target: tempNode.id,
              type: 'customEdge'
            };

            console.log('onConnectEnd: Adding new edge:', newEdge);
            addEdge(newEdge);
          }
        }
      } else if (connectingNodeId.current) {
        const sourceNode = nodeInternals.get(connectingNodeId.current);
        const targetNode = event.target.getAttribute('data-id');

        if (sourceNode && targetNode) {
          const newEdge = {
            id: nanoid(),
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
      addChildNode,
      addEdge,
      addNode
    ]
  );

  return {
    onConnectStart,
    onConnectEnd,
    parentNode,
    childNodePosition
  };
};
