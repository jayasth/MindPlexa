import { useCallback, useRef } from 'react';
import { useStore } from '@/app/store/useCanvasStore';
import { Node, XYPosition } from 'reactflow';
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

  console.log('nodeInternals:', nodeInternals);

  const connectingNodeId = useRef<string | null>(null);
  console.log('connectingNodeId.current:', connectingNodeId.current);

  const onConnectStart = useCallback(
    (event, node) => {
      console.log('onConnectStart event:', event);
      console.log('onConnectStart node:', node);
      connectingNodeId.current = node.nodeId || '';
      console.log('connectingNodeId.current:', connectingNodeId.current);
    },
    [connectingNodeId]
  );

  const onConnectEnd = useCallback(
    (event) => {
      console.log('onConnectEnd called');
      const targetIsPane = (event.target as Element).classList.contains(
        'react-flow__pane'
      );
      console.log('targetIsPane:', targetIsPane);

      if (targetIsPane && connectingNodeId.current) {
        const parentNode = nodeInternals.get(connectingNodeId.current);
        console.log('parentNode:', parentNode);

        if (parentNode && domNode) {
          const childNodePosition = getChildNodePosition(
            event,
            parentNode,
            domNode,
            screenToFlowPosition
          );
          console.log('childNodePosition:', childNodePosition);
          if (childNodePosition) {
            console.log('Child node position calculated:', childNodePosition);
            const newNode = {
              id: `selectionMenu-${nanoid()}`,
              type: 'selectionMenu',
              position: childNodePosition,
              data: {
                onSelect: (selectedNodeType, selectedPosition) => {
                  console.log('Selected node type:', selectedNodeType);
                  console.log(
                    'Selected position for new node:',
                    selectedPosition
                  );
                  createNode(
                    selectedNodeType,
                    selectedPosition,
                    nodes,
                    (newNode) => {
                      console.log('New node created:', newNode);
                      addNode(newNode);

                      addEdge({
                        id: `e-${nanoid()}`,
                        source: parentNode.id,
                        target: newNode.id,
                        type: 'customEdge'
                      });
                      console.log(
                        'Edge added between parent and new node:',
                        parentNode.id,
                        newNode.id
                      );
                    },
                    { width: 0, height: 0 },
                    false,
                    false
                  );
                  removeNode(newNode.id);
                  console.log('Temporary node removed:', newNode.id);
                },
                onClose: () => removeNode(newNode.id),
                parentNode: parentNode,
                isTemporary: true
              },
              width: nodeDimensions['selectionMenu'].width,
              height: nodeDimensions['selectionMenu'].height
            };

            addNode(newNode);
            console.log('New node added, useEdgeConnection:', newNode);
            console.log('width, useEdgeConnection:', newNode.width);
            console.log('height, useEdgeConnection:', newNode.height);
            addEdge({
              id: `e-${nanoid()}`,
              source: parentNode.id,
              target: newNode.id,
              type: 'customEdge'
            });
            console.log(
              'Edge added between parent and new node:',
              parentNode.id,
              newNode.id
            );

            // Update the parentNode and childNodePosition values
            return { parentNode, childNodePosition: newNode.position };
          } else {
            console.error('Failed to get valid child node position');
          }
        } else {
          console.error('Invalid or incomplete parentNode details.');
        }
      } else {
        const node = (event.target as Element).closest('.react-flow__node');
        if (node) {
          const targetNodeId = node.getAttribute('data-id');
          if (connectingNodeId.current && targetNodeId) {
            const targetNode = nodeInternals.get(targetNodeId);
            const edgeType = targetNode?.data.isEditing
              ? 'editingEdge'
              : 'customEdge';
            addEdge({
              id: `edge-${Date.now()}`,
              source: connectingNodeId.current,
              target: targetNodeId,
              type: edgeType
            });
          }
        }
      }

      connectingNodeId.current = '';
    },
    [
      addEdge,
      nodeInternals,
      getChildNodePosition,
      setShowNodeSelectionMenu,
      setMenuPosition,
      nodes,
      addNode,
      domNode,
      screenToFlowPosition,
      removeNode
    ]
  );

  return {
    onConnectStart,
    onConnectEnd,
    parentNode: null,
    childNodePosition: null
  };
};
