import React, { useCallback, useRef } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  ReactFlowProvider,
  NodeOrigin,
  ConnectionLineType,
  OnConnectStart,
  OnConnectEnd
} from 'reactflow';
import 'reactflow/dist/style.css';

import Toolbar from './toolbar';
import {
  handleAddNode,
  handleDownload,
  handleShare
} from './utils/canvasEditorUtils';
import NodeRenderer from '@/ui/nodes/NodeRenderer';
import CustomEdge from '@/ui/canvasEditor/CustomEdge';
import NodeSelectionMenu from '@/ui/nodes/NodeSelectionMenu';

const nodeTypes = {
  note: (props) => (
    <NodeRenderer {...props} onNodeResizeStop={handleNodeResizeStop} />
  ),
  task: (props) => (
    <NodeRenderer {...props} onNodeResizeStop={handleNodeResizeStop} />
  ),
  custom: (props) => (
    <NodeRenderer {...props} onNodeResizeStop={handleNodeResizeStop} />
  ),
  code: (props) => (
    <NodeRenderer {...props} onNodeResizeStop={handleNodeResizeStop} />
  ),
  draw: (props) => (
    <NodeRenderer {...props} onNodeResizeStop={handleNodeResizeStop} />
  ),
  selectionMenu: NodeSelectionMenu
};

const edgeTypes = {
  mindmap: CustomEdge
};

const nodeOrigin: NodeOrigin = [0.5, 0.5];
const connectionLineStyle = { stroke: '#F6AD55', strokeWidth: 3 };
const defaultEdgeOptions = { style: connectionLineStyle, type: 'mindmap' };

export default function CanvasEditor() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const connectingNodeId = useRef<string | null>(null);

  const onConnect = useCallback(
    (params) => {
      setEdges((eds) => [...eds, { ...params, type: 'mindmap' }]);
    },
    [setEdges]
  );

  const onConnectStart: OnConnectStart = useCallback((_, { nodeId }) => {
    connectingNodeId.current = nodeId;
  }, []);

  const onConnectEnd: OnConnectEnd = useCallback(
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

        // Calculate position based on the canvas offset
        const targetPosition =
          reactFlowBounds && event instanceof MouseEvent
            ? {
                x: event.clientX - reactFlowBounds.left + window.scrollX,
                y: event.clientY - reactFlowBounds.top + window.scrollY
              }
            : { x: 0, y: 0 };

        if (sourceNode) {
          const selectionMenuId = `selection-menu-${Date.now()}`;

          setNodes((nds) => [
            ...nds,
            {
              id: selectionMenuId,
              type: 'selectionMenu',
              position: targetPosition,
              data: {
                onSelect: (nodeType: string) => {
                  console.log('Creating node of type:', nodeType);
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

                  console.log('New node details:', newNode);

                  const newEdge = {
                    id: `edge-${Date.now()}`,
                    source: sourceNode.id,
                    target: newNodeId,
                    type: 'mindmap'
                  };

                  // Update nodes and edges
                  setNodes((currentNodes) => {
                    const newNodes = currentNodes
                      .filter((node) => node.id !== selectionMenuId)
                      .concat(newNode);
                    console.log('Updated nodes state:', newNodes);
                    return newNodes;
                  });
                  setEdges((currentEdges) => {
                    const newEdges = currentEdges.concat(newEdge);
                    console.log('Updated edges state:', newEdges);
                    return newEdges;
                  });
                }
              }
            }
          ]);

          setEdges((eds) => [
            ...eds,
            {
              id: `edge-${Date.now()}`,
              source: sourceNode.id,
              target: selectionMenuId,
              type: 'mindmap'
            }
          ]);
        }
      }

      connectingNodeId.current = null;
    },
    [nodes, setEdges, setNodes, reactFlowWrapper]
  );

  const handleNodeResizeStop = useCallback(
    (nodeId: string, newSize: { width: number; height: number }) => {
      setNodes((currentNodes) =>
        currentNodes.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  width: newSize.width,
                  height: newSize.height
                },
                style: { width: newSize.width, height: newSize.height }
              }
            : node
        )
      );
    },
    [setNodes]
  );

  const onSelect = (nodeType: string, position: { x: number; y: number }) => {
    console.log(`Creating node of type: ${nodeType} at position:`, position);
    const newNode = {
      id: `${nodeType}-${Date.now()}`,
      type: nodeType,
      position: position,
      data: {
        label: `New ${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)}`,
        width: 200,
        height: 300
      }
    };

    console.log('New node details:', newNode);

    setNodes((prevNodes) => {
      const updatedNodes = [...prevNodes, newNode];
      console.log('Updated nodes state:', updatedNodes);
      return updatedNodes;
    });

    if (connectingNodeId.current) {
      const newEdge = {
        id: `edge-${Date.now()}`,
        source: connectingNodeId.current,
        target: newNode.id,
        type: 'mindmap'
      };

      setEdges((prevEdges) => {
        const updatedEdges = [...prevEdges, newEdge];
        console.log('Updated edges state:', updatedEdges);
        return updatedEdges;
      });
    }

    connectingNodeId.current = null;
  };

  return (
    <div className="flex h-screen">
      <ReactFlowProvider>
        <div className="w-1/6 bg-gray-100 p-2">
          <Toolbar
            onUndo={() => console.log('Undo')}
            onRedo={() => console.log('Redo')}
            onShare={() => console.log('Share')}
            onDownload={() => console.log('Download')}
            setNodes={setNodes}
          />
        </div>
        <div className="w-5/6" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onConnectStart={onConnectStart}
            onConnectEnd={onConnectEnd}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            nodeOrigin={nodeOrigin}
            connectionLineStyle={connectionLineStyle}
            defaultEdgeOptions={defaultEdgeOptions}
            connectionLineType={ConnectionLineType.Straight}
            fitView={true}
          >
            <Background color="#aaa" gap={16} />
            <Controls />
          </ReactFlow>
        </div>
      </ReactFlowProvider>
    </div>
  );
}
function handleNodeResizeStop(
  nodeId: string,
  newSize: { width: number; height: number }
): void {
  throw new Error('Function not implemented.');
}
