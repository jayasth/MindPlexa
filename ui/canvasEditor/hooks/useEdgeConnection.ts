import { useCallback } from 'react';
import { useStore } from '@/app/store/useCanvasStore';

export const useEdgeConnection = () => {
  const {
    nodes,
    createChildNodeFromDrag,
    setShowNodeSelectionMenu,
    setMenuPosition
  } = useStore((state) => ({
    nodes: state.nodes,
    createChildNodeFromDrag: state.createChildNodeFromDrag,
    setShowNodeSelectionMenu: state.setShowNodeSelectionMenu,
    setMenuPosition: state.setMenuPosition
  }));

  const onConnectStart = useCallback((_, { nodeId }) => {
    console.log('Connect started from node:', nodeId);
  }, []);

  const onConnectEnd = useCallback(
    (event) => {
      const targetIsPane = event.target.classList.contains('react-flow__pane');

      if (targetIsPane) {
        const { clientX, clientY, sourceHandle } = event;
        const parentNode = nodes.find(
          (node) => node.id === sourceHandle?.split('-')[1]
        );

        if (parentNode) {
          const childPosition = {
            x: clientX - parentNode.position.x - (parentNode.width ?? 0) / 2,
            y: clientY - parentNode.position.y - (parentNode.height ?? 0) / 2
          };

          console.log('Creating child node with position:', childPosition);
          createChildNodeFromDrag(parentNode, childPosition, 'custom');
        } else {
          // Show node selection menu when the edge is released on an empty space
          setMenuPosition({ x: clientX, y: clientY });
          setShowNodeSelectionMenu(true);
        }
      }
    },
    [nodes, createChildNodeFromDrag, setShowNodeSelectionMenu, setMenuPosition]
  );

  return {
    onConnectStart,
    onConnectEnd
  };
};
