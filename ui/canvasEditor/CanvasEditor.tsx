import React from 'react';
import ReactFlow, {
  Controls,
  Background,
  ReactFlowProvider,
  NodeOrigin,
  ConnectionLineType,
  Node
} from 'reactflow';
import 'reactflow/dist/style.css';

import Toolbar from './toolbar';
import { handleDownload, handleShare } from './utils/canvasEditorUtils';
import NodeRenderer from '@/ui/nodes/NodeRenderer';
import CustomEdge from '@/ui/canvasEditor/CustomEdge';
import NodeSelectionMenu from '@/ui/nodes/NodeSelectionMenu';
import { useCanvasState } from './hooks/useCanvasState';
import { useNodeResizing } from './hooks/useNodeResizing';
import { useEdgeConnection } from './hooks/useEdgeConnection';
import { createNode } from './utils/nodeCreation';

const nodeTypes = {
  note: (props) => <NodeRenderer {...props} />,
  task: (props) => <NodeRenderer {...props} />,
  custom: (props) => <NodeRenderer {...props} />,
  code: (props) => <NodeRenderer {...props} />,
  draw: (props) => <NodeRenderer {...props} />,
  selectionMenu: NodeSelectionMenu
};

const edgeTypes = {
  mindmap: CustomEdge
};

const nodeOrigin: NodeOrigin = [0.5, 0.5];
const connectionLineStyle = { stroke: '#F6AD55', strokeWidth: 3 };
const defaultEdgeOptions = { style: connectionLineStyle, type: 'mindmap' };

export default function CanvasEditor() {
  const {
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
    menuPosition,
    setMenuPosition
  } = useCanvasState();

  return (
    <div className="flex h-screen">
      <ReactFlowProvider>
        <div className="w-1/6 bg-gray-100 p-2">
          <Toolbar
            onUndo={() => console.log('Undo')}
            onRedo={() => console.log('Redo')}
            onShare={() => handleShare(nodes)}
            onDownload={() => handleDownload({ nodes, edges })}
            setNodes={setNodes} // Correctly passing setNodes from useCanvasState
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
