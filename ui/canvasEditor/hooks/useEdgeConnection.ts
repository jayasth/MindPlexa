import { useCallback, useRef } from 'react';
import { useStore } from '@/app/store/useCanvasStore';
import { createNode } from '@/ui/canvasEditor/utils/nodeCreation';
import { getChildNodePosition } from '@/ui/canvasEditor/utils/getChildNodePosition';
import { nanoid } from 'nanoid';
import { nodeDimensions } from '@/ui/canvasEditor/utils/nodeProperties';

export const useEdgeConnection = () => {
  const {
    nodes,
    setEdges,
    addEdge,
    removeNode,
    domNode,
    screenToFlowPosition,
    nodeInternals,
    addNode
  } = useStore((state) => ({
    nodes: state.nodes,
    setEdges: state.setEdges,
    setShowNodeSelectionMenu: state.setShowNodeSelectionMenu,
    setMenuPosition: state.setMenuPosition,
    addChildNode: state.addChildNode,
    addEdge: state.addEdge,
    removeNode: state.removeNode,
    domNode: state.domNode,
    screenToFlowPosition: state.screenToFlowPosition,
    nodeInternals: state.nodeInternals,
    addNode: state.addNode,
    updateNode: state.updateNode,
    toggleEditMode: state.toggleEditMode
  }));

  console.log('useEdgeConnection: nodeInternals:', nodeInternals);

  const createChildNodeFromDrag = useCallback(
    (parentNode, position, nodeType) => {
      const {
        domNode,
        screenToFlowPosition,
        nodes,
        addNode,
        setEdges,
        removeNode
      } = useStore.getState();

      if (!domNode) {
        console.error('DOM node is not available.');
        return;
      }

      const flowPosition = screenToFlowPosition(position);
      const event = new MouseEvent('click', {
        clientX: flowPosition.x,
        clientY: flowPosition.y
      });
      const childNodePosition = getChildNodePosition(
        event,
        parentNode,
        domNode,
        screenToFlowPosition
      );
      if (!childNodePosition) {
        console.error('Failed to calculate child node position.');
        return;
      }

      createNode(
        nodeType,
        childNodePosition,
        nodes,
        (newNode) => {
          addNode(newNode);
          setEdges((edges) => [
            ...edges,
            {
              id: `e-${nanoid()}`,
              source: parentNode.id,
              target: newNode.id,
              type: 'customEdge'
            }
          ]);
        },
        { width: 0, height: 0 },
        false,
        false,
        parentNode
      );
    },
    [
      domNode,
      screenToFlowPosition,
      nodes,
      addNode,
      setEdges,
      removeNode,
      createNode
    ]
  );

  const connectingNodeId = useRef<string | null>(null);
  console.log(
    'useEdgeConnection: connectingNodeId.current:',
    connectingNodeId.current
  );

  const onConnectStart = useCallback(
    (event, node) => {
      console.log('useEdgeConnection: onConnectStart event:', event);
      console.log('useEdgeConnection: onConnectStart node:', node);
      connectingNodeId.current = node.nodeId || '';
      console.log(
        'useEdgeConnection: connectingNodeId.current:',
        connectingNodeId.current
      );
    },
    [connectingNodeId]
  );

  const onConnectEnd = useCallback(
    (event) => {
      const targetIsPane = (event.target as Element).classList.contains(
        'react-flow__pane'
      );
      console.log(
        'useEdgeConnection: onConnectEnd: targetIsPane',
        targetIsPane
      );

      if (targetIsPane && connectingNodeId.current) {
        const parentNode = nodeInternals.get(connectingNodeId.current);
        console.log('onConnectEnd: parentNode:', parentNode);

        if (parentNode && domNode) {
          const position = getChildNodePosition(
            event,
            parentNode,
            domNode,
            screenToFlowPosition
          );
          console.log('onConnectEnd: position:', position);

          if (position) {
            createNode(
              'selectionMenu',
              position,
              nodes,
              (newNode) => {
                addNode(newNode);
                addEdge({
                  id: `e-${nanoid()}`,
                  source: parentNode.id,
                  target: newNode.id,
                  type: 'customEdge'
                });
                console.log(
                  'useEdgeConnection: onConnectEnd: newNode added',
                  newNode
                );
              },
              {
                width: nodeDimensions['selectionMenu'].width,
                height: nodeDimensions['selectionMenu'].height
              },
              true,
              false,
              parentNode // Pass the parentNode to createNode
            );
          } else {
            console.error('Failed to get valid position');
          }
        } else {
          console.error('Invalid or incomplete parentNode details.');
        }
      }
    },
    [
      addEdge,
      nodeInternals,
      getChildNodePosition,
      nodes,
      addNode,
      domNode,
      screenToFlowPosition,
      createNode
    ]
  );

  return {
    onConnectStart,
    onConnectEnd,
    createChildNodeFromDrag,
    parentNode: null,
    childNodePosition: null
  };
};
