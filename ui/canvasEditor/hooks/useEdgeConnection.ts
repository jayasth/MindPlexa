import { useCallback, useRef } from 'react';
import { useStore } from '@/app/store/useCanvasStore';
import { createNode } from '@/ui/canvasEditor/utils/nodeCreation';
import { getChildNodePosition } from '@/ui/canvasEditor/utils/getChildNodePosition';
import { nanoid } from 'nanoid';
import { nodeDimensions } from '@/ui/canvasEditor/utils/nodeProperties';

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
    updateNode,
    toggleEditMode
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
    updateNode: state.updateNode,
    toggleEditMode: state.toggleEditMode
  }));

  console.log('Store: nodeInternals:', nodeInternals);

  const connectingNodeId = useRef<string | null>(null);
  console.log('Store: connectingNodeId.current:', connectingNodeId.current);

  const onConnectStart = useCallback(
    (event, node) => {
      console.log('Store: onConnectStart event:', event);
      console.log('Store: onConnectStart node:', node);
      connectingNodeId.current = node.nodeId || '';
      console.log('Store: connectingNodeId.current:', connectingNodeId.current);
    },
    [connectingNodeId]
  );

  const onConnectEnd = useCallback(
    (event) => {
      const targetIsPane = (event.target as Element).classList.contains(
        'react-flow__pane'
      );
      console.log('Store: onConnectEnd: targetIsPane', targetIsPane);

      if (targetIsPane && connectingNodeId.current) {
        const parentNode = nodeInternals.get(connectingNodeId.current);
        console.log('Store: onConnectEnd: parentNode', parentNode);

        if (parentNode && domNode) {
          const childNodePosition = getChildNodePosition(
            event,
            parentNode,
            domNode,
            screenToFlowPosition
          );
          console.log(
            'Store: onConnectEnd: childNodePosition',
            childNodePosition
          );

          if (childNodePosition) {
            createNode(
              'selectionMenu',
              childNodePosition,
              nodes,
              (newNode) => {
                addNode(newNode);
                addEdge({
                  id: `e-${nanoid()}`,
                  source: parentNode.id,
                  target: newNode.id,
                  type: 'customEdge'
                });
                console.log('Store: onConnectEnd: newNode added', newNode);
              },
              {
                width: nodeDimensions['selectionMenu'].width,
                height: nodeDimensions['selectionMenu'].height
              },
              true
            );
          } else {
            console.error('Failed to get valid child node position');
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
    parentNode: null,
    childNodePosition: null
  };
};
