import { useCallback, useRef, useState } from 'react';
import { Node, Edge, useNodesState, useEdgesState } from 'reactflow';

export const useCanvasState = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
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
        const sourceNode = nodes.find(
          (node) => node.id === connectingNodeId.current
        );
        const reactFlowBounds =
          reactFlowWrapper.current?.getBoundingClientRect();
        const targetPosition =
          reactFlowBounds && event instanceof MouseEvent
            ? {
                x: event.clientX - reactFlowBounds.left + window.scrollX,
                y: event.clientY - reactFlowBounds.top + window.scrollY
              }
            : { x: 0, y: 0 };

        // Additional logic for handling node creation and connection can be added here
      }
      connectingNodeId.current = null;
    },
    [nodes, setEdges, reactFlowWrapper]
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
    reactFlowWrapper
  };
};
