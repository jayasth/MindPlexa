// components/reactflow/diagram.tsx
'use client';

import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  Connection,
  Edge,
  MarkerType
} from 'reactflow';
import { CustomNode } from './custom-node';

interface DiagramProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
}

const Diagram = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange
}: DiagramProps) => {
  const onConnect = useCallback(
    (params: Edge | Connection) => onEdgesChange([addEdge(params, edges)]),
    [edges, onEdgesChange]
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
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
    >
      <Background />
      <Controls />
    </ReactFlow>
  );
};

export default Diagram;
