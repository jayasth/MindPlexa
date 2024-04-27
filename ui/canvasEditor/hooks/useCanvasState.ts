import { useCallback, useRef, useState } from 'react';
import { Node, Edge, useNodesState, useEdgesState } from 'reactflow';

export const useCanvasState = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [menuPosition, setMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const connectingNodeId = useRef<string | null>(null);

  const onConnect = useCallback(
    (params) => {
      setEdges((eds) => [...eds, { ...params, type: 'mindmap' }]);
    },
    [setEdges]
  );

  const onConnectStart = useCallback((_, { nodeId }) => {
    connectingNodeId.current = nodeId;
  }, []);

  const onConnectEnd = useCallback(
    (event) => {
      const targetIsPane = (event.target as Element).classList.contains(
        'react-flow__pane'
      );
      if (targetIsPane && connectingNodeId.current) {
        const reactFlowBounds =
          reactFlowWrapper.current?.getBoundingClientRect();
        const position =
          reactFlowBounds && event instanceof MouseEvent
            ? {
                x: event.clientX - reactFlowBounds.left + window.scrollX,
                y: event.clientY - reactFlowBounds.top + window.scrollY
              }
            : { x: 0, y: 0 };

        setMenuPosition(position);
      }
      connectingNodeId.current = null;
    },
    [reactFlowWrapper]
  );

  return {
    nodes,
    setNodes,
    onNodesChange,
    edges,
    setEdges,
    onEdgesChange,
    onConnect,
    onConnectStart,
    onConnectEnd,
    menuPosition,
    setMenuPosition,
    reactFlowWrapper
  };
};
