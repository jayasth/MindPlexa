import { useCallback, useRef, useState } from 'react';
import { Node, Edge, useNodesState, useEdgesState } from 'reactflow';

export const useCanvasState = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const connectingNodeId = useRef<string | null>(null);
  const [showNodeSelectionMenu, setShowNodeSelectionMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [menuNodeId, setMenuNodeId] = useState<string | null>(null);

  const onConnect = useCallback(
    (params) => {
      setEdges((eds) => [...eds, { ...params, type: 'mindmap' }]);
    },
    [setEdges]
  );

  const onConnectStart = useCallback((_, { nodeId }) => {
    connectingNodeId.current = nodeId;
    console.log('Connect start from node:', nodeId);
  }, []);

  const onConnectEnd = useCallback(
    (event) => {
      const targetIsPane = (event.target as Element).classList.contains(
        'react-flow__pane'
      );
      console.log('Is target a pane?', targetIsPane);
      if (targetIsPane && connectingNodeId.current) {
        const reactFlowBounds =
          reactFlowWrapper.current?.getBoundingClientRect();
        const position = {
          x: event.clientX - (reactFlowBounds?.left ?? 0) + window.scrollX,
          y: event.clientY - (reactFlowBounds?.top ?? 0) + window.scrollY
        };
        console.log('Menu position set to:', position);
        setMenuPosition(position);
        setShowNodeSelectionMenu(true);
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
    reactFlowWrapper,
    showNodeSelectionMenu,
    setShowNodeSelectionMenu,
    menuPosition,
    setMenuPosition
  };
};
