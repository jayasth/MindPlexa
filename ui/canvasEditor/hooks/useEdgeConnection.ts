import { useCallback, useRef } from 'react';
import { useStore } from '@/app/store/useCanvasStore';
import { Node, XYPosition } from 'reactflow';
import { createNode } from '@/ui/canvasEditor/utils/nodeCreation';
import { getChildNodePosition } from '@/ui/canvasEditor/utils/getChildNodePosition';
import { nanoid } from 'nanoid';

export const useEdgeConnection = () => {
  const {
    nodes,
    setShowNodeSelectionMenu,
    setMenuPosition,
    addChildNode,
    addEdge,
    removeNode,
    domNode,
    screenToFlowPosition,
    nodeInternals,
    addNode,
    updateNode
  } = useStore((state) => ({
    nodes: state.nodes,
    setShowNodeSelectionMenu: state.setShowNodeSelectionMenu,
    setMenuPosition: state.setMenuPosition,
    addChildNode: state.addChildNode,
    addEdge: state.addEdge,
    removeNode: state.removeNode,
    domNode: state.domNode,
    screenToFlowPosition: state.screenToFlowPosition,
    nodeInternals: state.nodeInternals,
    addNode: state.addNode,
    updateNode: state.updateNode
  }));

  console.log('nodeInternals:', nodeInternals);

  const connectingNodeId = useRef<string | null>(null);
  console.log('connectingNodeId.current:', connectingNodeId.current);

  const onConnectStart = useCallback(
    (event, node) => {
      console.log('onConnectStart event:', event);
      console.log('onConnectStart node:', node);
      connectingNodeId.current = node.nodeId || '';
      console.log('connectingNodeId.current:', connectingNodeId.current);
    },
    [connectingNodeId]
  );

  const onConnectEnd = useCallback(
    (event) => {
      console.log('onConnectEnd called');
      console.log('event.target:', event.target);
      const targetIsPane = (event.target as Element).classList.contains(
        'react-flow__pane'
      );
      console.log('targetIsPane:', targetIsPane);

      if (targetIsPane && connectingNodeId.current) {
        console.log('connectingNodeId.current:', connectingNodeId.current);
        console.log('nodeInternals:', nodeInternals);
        const parentNode = nodeInternals.get(connectingNodeId.current);
        console.log('parentNode:', parentNode);

        if (parentNode && domNode) {
          const childNodePosition = getChildNodePosition(
            event,
            parentNode,
            domNode,
            screenToFlowPosition
          );
          console.log('childNodePosition:', childNodePosition);

          if (childNodePosition) {
            setShowNodeSelectionMenu(true);
            setMenuPosition({ x: event.clientX, y: event.clientY });

            // Create a new temporary NodeSelectionMenu node
            createNode(
              'selectionMenu',
              childNodePosition,
              nodes,
              (newNode) => {
                addNode(newNode);
                const newEdge = {
                  id: nanoid(),
                  source: parentNode.id,
                  target: newNode.id,
                  type: 'customEdge'
                };
                addEdge(newEdge);
              },
              { width: 0, height: 0 },
              true
            );

            return { parentNode, childNodePosition };
          } else {
            console.error('Failed to get valid child node position');
          }
        } else {
          console.error('Invalid or incomplete parentNode details.');
        }
      } else {
        const node = (event.target as Element).closest('.react-flow__node');

        if (node) {
          const targetNodeId = node.getAttribute('data-id');
          if (connectingNodeId.current && targetNodeId) {
            addEdge({
              id: `edge-${Date.now()}`,
              source: connectingNodeId.current,
              target: targetNodeId,
              type: 'customEdge'
            });
          }
        }
      }

      connectingNodeId.current = '';
      return null;
    },
    [
      addEdge,
      nodeInternals,
      getChildNodePosition,
      setShowNodeSelectionMenu,
      setMenuPosition,
      nodes,
      addNode,
      domNode,
      screenToFlowPosition
    ]
  );

  return {
    onConnectStart,
    onConnectEnd,
    parentNode: null,
    childNodePosition: null
  };
};
