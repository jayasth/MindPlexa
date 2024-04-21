import React, { useCallback, useRef } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  NodeTypes,
  EdgeTypes,
  Node
} from 'reactflow';
import 'reactflow/dist/style.css';

import Toolbar from './toolbar';
import {
  Edge,
  Node as CanvasNode
} from '@/ui/canvasEditor/canvasEditorReducer';
import {
  handleAddNode,
  handleDownload,
  handleShare
} from './utils/canvasEditorUtils';
import Diagram from './diagram';

// Import custom node components
import NoteNode from '@/ui/nodes/NoteNode';
import TaskNode from '@/ui/nodes/TaskNode';
import CustomNode from '@/ui/nodes/CustomNode';
import CodeNode from '@/ui/nodes/CodeNode';
import DrawNode from '@/ui/nodes/DrawNode';

// Define custom node types
const nodeTypes: NodeTypes = {
  note: NoteNode,
  task: TaskNode,
  custom: CustomNode,
  code: CodeNode,
  draw: DrawNode
};

const edgeTypes: EdgeTypes = {};

interface CanvasEditorProps {
  initialCanvas?: {
    nodes: CanvasNode[];
    edges: Edge[];
  };
  mermaidCode?: string;
}

export default function CanvasEditor(props: CanvasEditorProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(
    (props.initialCanvas?.nodes || []).map((node) => ({
      id: node.id,
      type: node.type || 'default', // Ensure a valid type or fallback to a default type
      position: node.position ? JSON.parse(node.position) : { x: 0, y: 0 }, // Parse position if it's stored as JSON
      data: node // Assign the entire node object to data
    }))
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    props.initialCanvas?.edges || []
  );
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="flex h-screen">
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
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
        >
          <Background color="#aaa" gap={16} />
          <Controls />
          <Diagram mermaidCode={props.mermaidCode} />
        </ReactFlow>
      </div>
    </div>
  );
}
