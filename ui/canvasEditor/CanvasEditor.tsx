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

const nodeTypes = {
  note: NodeRenderer,
  task: NodeRenderer,
  custom: NodeRenderer,
  code: NodeRenderer,
  draw: NodeRenderer
};

const edgeTypes = {
  mindmap: CustomEdge
};

const nodeOrigin: NodeOrigin = [0.5, 0.5];
const connectionLineStyle = { stroke: '#F6AD55', strokeWidth: 3 };
const defaultEdgeOptions = { style: connectionLineStyle, type: 'mindmap' };

export default function MindMapCanvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const connectingNodeId = useRef<string | null>(null);

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
        const targetPosition =
          event instanceof MouseEvent
            ? {
                x: event.clientX,
                y: event.clientY
              }
            : { x: 0, y: 0 }; // Default to (0, 0) if the event is not a MouseEvent

        if (sourceNode) {
          const newNode = {
            id: `default-${Date.now()}`,
            type: 'default',
            position: targetPosition,
            data: { label: 'New Node' }
          };

          const newEdge = {
            id: `edge-${Date.now()}`,
            source: sourceNode.id,
            target: newNode.id
          };

          setNodes((nds) => nds.concat(newNode));
          setEdges((eds) => eds.concat(newEdge));
        }
      }

      connectingNodeId.current = null;
    },
    [nodes, setEdges, setNodes]
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="flex h-screen">
      <ReactFlowProvider>
        <div className="w-1/6 bg-gray-100 p-2">
          <Toolbar
            onAddNode={(nodeType) =>
              handleAddNode(nodeType, setNodes, reactFlowWrapper)
            }
            onUndo={() => console.log('Undo')}
            onRedo={() => console.log('Redo')}
            onShare={() => handleShare({ nodes, edges })}
            onDownload={() => handleDownload({ nodes, edges })}
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
            fitView
          >
            <Background color="#aaa" gap={16} />
            <Controls />
          </ReactFlow>
        </div>
      </ReactFlowProvider>
    </div>
  );
}
