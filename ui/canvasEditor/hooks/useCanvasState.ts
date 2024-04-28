import { useCallback, useRef, useState } from 'react';
import { Node, Edge, useNodesState, useEdgesState } from 'reactflow';
import { createNode } from '../utils/nodeCreation';

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
      console.log('onConnectEnd triggered', event);
      const targetIsPane = (event.target as Element).classList.contains(
        'react-flow__pane'
      );
      const elementUnderCursor = document.elementFromPoint(
        event.clientX,
        event.clientY
      );
      const noNodeUnderCursor =
        elementUnderCursor && !elementUnderCursor.closest('.react-flow__node');

      console.log(
        'Target is pane:',
        targetIsPane,
        'No node under cursor:',
        noNodeUnderCursor
      );

      if (targetIsPane && connectingNodeId.current && noNodeUnderCursor) {
        const sourceNode = nodes.find(
          (node) => node.id === connectingNodeId.current
        );
        console.log('Source Node:', sourceNode);

        const reactFlowBounds =
          reactFlowWrapper.current?.getBoundingClientRect();
        console.log('React Flow Bounds:', reactFlowBounds);

        if (reactFlowBounds && sourceNode) {
          const targetPosition = {
            x: event.clientX - reactFlowBounds.left + window.scrollX,
            y: event.clientY - reactFlowBounds.top + window.scrollY
          };

          console.log('Target Position:', targetPosition);

          const selectionMenuNodeId = `selection-menu-${Date.now()}`;
          const selectionMenuNode = {
            id: selectionMenuNodeId,
            type: 'selectionMenu',
            position: targetPosition,
            data: {
              onSelect: (nodeType, position) => {
                const newNodeId = `${nodeType}-${Date.now()}`;
                createNode(nodeType, position, (newNode) => {
                  setNodes((currentNodes) => [...currentNodes, newNode]);
                  setEdges((currentEdges) => [
                    ...currentEdges,
                    {
                      id: `edge-${Date.now()}`,
                      source: sourceNode.id,
                      target: newNodeId,
                      type: 'mindmap'
                    }
                  ]);
                });
              },
              onClose: () => setShowNodeSelectionMenu(false),
              id: selectionMenuNodeId, // Ensuring data.id is passed correctly
              isStandalone: false // Ensuring isStandalone is set correctly
            },
            draggable: true,
            connectable: true,
            width: 200,
            height: 100
          };

          console.log('Selection Menu Node:', selectionMenuNode);

          setNodes((nds) => [...nds, selectionMenuNode]);
          setMenuPosition(targetPosition);
          setShowNodeSelectionMenu(true);
          setMenuNodeId(selectionMenuNodeId);

          setEdges((eds) => [
            ...eds,
            {
              id: `edge-${Date.now()}`,
              source: sourceNode.id,
              target: selectionMenuNodeId,
              type: 'mindmap'
            }
          ]);
        }
      }
      connectingNodeId.current = null;
    },
    [nodes, setNodes, setEdges, reactFlowWrapper]
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
    setMenuPosition,
    menuNodeId
  };
};
