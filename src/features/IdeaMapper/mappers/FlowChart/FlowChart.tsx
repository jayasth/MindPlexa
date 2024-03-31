// src/features/IdeaMapper/mappers/FlowChart/FlowChart.tsx
import React, { useCallback } from "react";
import ReactFlow, {
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
} from "reactflow";
import FlowNode from "./FlowNode";
import FlowEdge from "./FlowEdge";

const FlowChart: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const nodeTypes = {
    flowNode: FlowNode,
  };

  const edgeTypes = {
    flowEdge: FlowEdge,
  };

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
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
      edgeTypes={edgeTypes}
      fitView
    />
  );
};

export default FlowChart;
