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

  const getChildNodePosition = useCallback(
    (event: MouseEvent | TouchEvent, parentNode?: Node) => {
      if (
        !domNode ||
        !parentNode?.positionAbsolute ||
        !parentNode?.width ||
        !parentNode?.height
      ) {
        return;
      }

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
          panePosition.x - parentNode.positionAbsolute.x + parentNode.width / 2,
          canvasWidth - 100
        )
      );
      const newNodeY = Math.max(
        0,
        Math.min(
          panePosition.y -
            parentNode.positionAbsolute.y +
            parentNode.height / 2,
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

  const onConnectStart = useCallback((_, { nodeId }) => {
    connectingNodeId.current = nodeId;
  }, []);

  const onConnectEnd = useCallback(
    (event) => {
      const targetIsPane = (event.target as Element).classList.contains(
        'react-flow__pane'
      );
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
      } else if (targetIsPane && connectingNodeId.current) {
        const parentNode = nodeInternals.get(connectingNodeId.current);
        const childNodePosition = getChildNodePosition(event, parentNode);
        if (parentNode && childNodePosition) {
          const canvasSize = {
            width: window.innerWidth,
            height: window.innerHeight
          };
          createNode(
            'custom',
            childNodePosition,
            nodes,
            (newNode) => {
              addNode(newNode);
              const handleNodeSelect = (
                nodeType: 'note' | 'task' | 'custom' | 'code' | 'draw',
                position: XYPosition
              ) => {
                createNode(nodeType, position, nodes, addNode, canvasSize);
                removeNode(newNode.id);
              };
              const handleCloseMenu = () => {
                removeNode(newNode.id);
              };
              updateNode(newNode.id, {
                data: {
                  onSelect: handleNodeSelect,
                  position: childNodePosition,
                  onClose: handleCloseMenu,
                  id: newNode.id,
                  isStandalone: true
                }
              });
              setMenuPosition(childNodePosition);
              setShowNodeSelectionMenu(true);
              addChildNode(parentNode, childNodePosition, 'custom');
            },
            canvasSize
          );
        }
      }

      connectingNodeId.current = null;
    },
    [
      getChildNodePosition,
      addEdge,
      addNode,
      removeNode,
      updateNode,
      nodes,
      nodeInternals,
      screenToFlowPosition,
      setMenuPosition,
      setShowNodeSelectionMenu,
      addChildNode
    ]
  );

  return {
    onConnectStart,
    onConnectEnd
  };
};
