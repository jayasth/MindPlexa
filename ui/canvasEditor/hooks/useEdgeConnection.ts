import { useCallback, useRef } from 'react';
import { useStore } from '@/app/store/useCanvasStore';
import { Node, XYPosition } from 'reactflow';

export const useEdgeConnection = () => {
  const { nodes, setShowNodeSelectionMenu, setMenuPosition, addChildNode } =
    useStore((state) => ({
      nodes: state.nodes,
      setShowNodeSelectionMenu: state.setShowNodeSelectionMenu,
      setMenuPosition: state.setMenuPosition,
      addChildNode: state.addChildNode
    }));

  const connectingNodeId = useRef<string | null>(null);

  const getChildNodePosition = useCallback(
    (event: MouseEvent | TouchEvent, parentNode?: Node) => {
      const { domNode, screenToFlowPosition } = useStore.getState();

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
    []
  );

  const onConnectStart = useCallback((_, { nodeId }) => {
    connectingNodeId.current = nodeId;
  }, []);

  const onConnectEnd = useCallback(
    (event) => {
      const { nodeInternals } = useStore.getState();
      const targetIsPane = (event.target as Element).classList.contains(
        'react-flow__pane'
      );
      const node = (event.target as Element).closest('.react-flow__node');

      if (node) {
        node.querySelector('input')?.focus({ preventScroll: true });
      } else if (targetIsPane && connectingNodeId.current) {
        const parentNode = nodeInternals.get(connectingNodeId.current);
        const childNodePosition = getChildNodePosition(event, parentNode);

        if (parentNode && childNodePosition) {
          addChildNode(parentNode, childNodePosition);
        } else {
          setMenuPosition({ x: 0, y: 0 });
          setShowNodeSelectionMenu(true);
        }
      }

      connectingNodeId.current = null;
    },
    [
      getChildNodePosition,
      addChildNode,
      setShowNodeSelectionMenu,
      setMenuPosition
    ]
  );

  return {
    onConnectStart,
    onConnectEnd
  };
};
