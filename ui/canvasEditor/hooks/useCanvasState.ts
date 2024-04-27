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

      if (targetIsPane && connectingNodeId.current && noNodeUnderCursor) {
        const sourceNode = nodes.find(
          (node) => node.id === connectingNodeId.current
        );
        const reactFlowBounds =
          reactFlowWrapper.current?.getBoundingClientRect();

        if (reactFlowBounds && sourceNode) {
          const targetPosition = {
            x: event.clientX - reactFlowBounds.left + window.scrollX,
            y: event.clientY - reactFlowBounds.top + window.scrollY
          };

          const selectionMenuNode = {
            id: `selection-menu-${Date.now()}`,
            type: 'selectionMenu',
            position: targetPosition,
            data: {
              onSelect: (nodeType: string) => {
                const newNodeId = `${nodeType}-${Date.now()}`;
                const newNode = {
                  id: newNodeId,
                  type: nodeType,
                  position: targetPosition,
                  data: {
                    label: `New ${nodeType} Node`,
                    width: 200,
                    height: 300
                  }
                };

                setNodes((currentNodes) => {
                  const newNodes = currentNodes
                    .filter((node) => node.id !== selectionMenuNode.id)
                    .concat(newNode);
                  return newNodes;
                });
                setEdges((currentEdges) => [
                  ...currentEdges,
                  {
                    id: `edge-${Date.now()}`,
                    source: sourceNode.id,
                    target: newNodeId,
                    type: 'mindmap'
                  }
                ]);
              },
              onClose: () => setShowNodeSelectionMenu(false)
            },
            draggable: true,
            connectable: true
          };

          setNodes((nds) => [...nds, selectionMenuNode]);
          setShowNodeSelectionMenu(true);
          setMenuPosition(targetPosition);

          setEdges((eds) => [
            ...eds,
            {
              id: `edge-${Date.now()}`,
              source: sourceNode.id,
              target: selectionMenuNode.id, // Corrected from selectionMenuId to selectionMenuNode.id
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
    setMenuPosition
  };
};
