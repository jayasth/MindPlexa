import { useCallback, useRef } from 'react';
import { useStore } from '@/app/store/useCanvasStore';
import { Node, XYPosition } from 'reactflow';
import { createNode } from '@/ui/canvasEditor/utils/nodeCreation';

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

  const connectingNodeId = useRef<string | null>(null);
  console.log('connectingNodeId.current:', connectingNodeId.current);

  const getChildNodePosition = useCallback(
    (event: MouseEvent | TouchEvent, parentNode?: Node) => {
      console.log('parentNode:', parentNode);
      if (!domNode) {
        console.error(
          'domNode is not available at the time of event handling.'
        );
        return null;
      }

      if (!parentNode || !parentNode.positionAbsolute) {
        console.error('Invalid or incomplete parentNode details.');
        return null;
      }

      const parentNodeWidth = parentNode.width || 0;
      const parentNodeHeight = parentNode.height || 0;

      const isTouchEvent = 'touches' in event;
      const x = isTouchEvent ? event.touches[0].clientX : event.clientX;
      const y = isTouchEvent ? event.touches[0].clientY : event.clientY;
      const panePosition = screenToFlowPosition({
        x,
        y
      });

      // Ensure the new node is within the visible area of the canvas
      const canvasWidth = domNode.offsetWidth;
      const canvasHeight = domNode.offsetHeight;
      const newNodeX = Math.max(
        0,
        Math.min(
          panePosition.x - parentNode.positionAbsolute.x + parentNodeWidth / 2,
          canvasWidth - 100
        )
      );
      const newNodeY = Math.max(
        0,
        Math.min(
          panePosition.y - parentNode.positionAbsolute.y + parentNodeHeight / 2,
          canvasHeight - 100
        )
      );

      return {
        x: newNodeX,
        y: newNodeY
      };
    },
    [domNode, screenToFlowPosition]
  );

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

        if (parentNode) {
          const childNodePosition = getChildNodePosition(event, parentNode);
          console.log('childNodePosition:', childNodePosition);

          if (childNodePosition) {
            setShowNodeSelectionMenu(true);
            setMenuPosition({ x: event.clientX, y: event.clientY });
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
      setMenuPosition
    ]
  );

  return {
    onConnectStart,
    onConnectEnd,
    parentNode: null,
    childNodePosition: null
  };
};
