import { useCallback, useRef } from 'react';
import { Node, Edge, useEdgesState } from 'reactflow';

export const useEdgeConnection = (
  nodes: Node[],
  setNodes: (func: (nodes: Node[]) => Node[]) => void
) => {
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const connectingNodeId = useRef<string | null>(null);

  const onConnect = useCallback(
    (params) => {
      const newEdge = {
        ...params,
        id: `edge-${Date.now()}`, // Unique ID for each new edge
        type: 'customEdge'
      };
      setEdges((eds) => [...eds, newEdge]);
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
        const reactFlowBounds = event.currentTarget.getBoundingClientRect();
        const targetPosition = {
          x: event.clientX - reactFlowBounds.left + window.scrollX,
          y: event.clientY - reactFlowBounds.top + window.scrollY
        };

        // Logic to create a new node at targetPosition can be added here
      }
      connectingNodeId.current = null;
    },
    [nodes, setEdges]
  );

  return {
    edges,
    setEdges,
    onEdgesChange,
    onConnect,
    onConnectStart,
    onConnectEnd
  };
};
