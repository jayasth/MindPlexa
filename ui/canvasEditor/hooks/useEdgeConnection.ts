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

      return {
        x:
          panePosition.x - parentNode.positionAbsolute.x + parentNode.width / 2,
        y:
          panePosition.y - parentNode.positionAbsolute.y + parentNode.height / 2
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
          createNode('custom', childNodePosition, (newNode) => {
            addNode(newNode);
            const handleNodeSelect = (
              nodeType: 'note' | 'task' | 'custom' | 'code' | 'draw',
              position: XYPosition
            ) => {
              createNode(nodeType, position, addNode);
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
          });
        } else {
          const menuPosition = screenToFlowPosition({
            x: event.clientX,
            y: event.clientY
          });
          setMenuPosition(menuPosition);
          setShowNodeSelectionMenu(true);
        }
      }

      connectingNodeId.current = null;
    },
    [
      getChildNodePosition,
      addChildNode,
      setShowNodeSelectionMenu,
      setMenuPosition,
      nodeInternals,
      screenToFlowPosition,
      addEdge,
      addNode,
      removeNode,
      updateNode
    ]
  );

  return {
    onConnectStart,
    onConnectEnd
  };
};
