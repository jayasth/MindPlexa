'use client';

import React, { useEffect, useMemo } from 'react';
import { useState, useCallback } from 'react';
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
  Edge,
  MiniMap,
  ReactFlowProvider
} from 'reactflow';
import { CustomNode } from './custom-node';
import { parseMermaidCode } from '@/utils/canvas/mermaid-utils';

interface DiagramProps {
  mermaidCode?: string;
  isComplete?: boolean;
}

const Diagram = ({ mermaidCode = '', isComplete = false }: DiagramProps) => {
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

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

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

  const nodeTypes = useMemo(
    () => ({
      startEvent: CustomNode,
      endEvent: CustomNode,
      activity: CustomNode
    }),
    []
  );

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          onNodesChange={onNodesChange}
          edges={edges}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
};

export default Diagram;
