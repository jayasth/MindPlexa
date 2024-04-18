// ui/canvasEditor/diagram.tsx

import React, { useEffect, useState, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  EdgeChange,
  Node,
  NodeChange,
  applyEdgeChanges,
  applyNodeChanges,
  addEdge,
  Connection,
  Edge
} from 'reactflow';
import { CustomNode } from './custom-node';
import { parseMermaidCode } from '@/utils/canvas/mermaid-utils';

// Define nodeTypes outside the component
const nodeTypes = {
  startEvent: CustomNode,
  endEvent: CustomNode,
  activity: CustomNode
};

interface DiagramProps {
  mermaidCode?: string;
  isComplete?: boolean;
}

const Diagram = ({ mermaidCode = '', isComplete = false }: DiagramProps) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  useEffect(() => {
    async function parse() {
      const { nodes, edges } = await parseMermaidCode(mermaidCode);
      setEdges(edges);
      setNodes(nodes);
    }
    if (isComplete && mermaidCode) {
      parse();
    }
  }, [mermaidCode, isComplete]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );
  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  return (
    <ReactFlow
      nodes={nodes}
      onNodesChange={onNodesChange}
      edges={edges}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      style={{ width: '100%', height: '100%' }}
    >
      <Background />
      <Controls />
    </ReactFlow>
  );
};

export default Diagram;
