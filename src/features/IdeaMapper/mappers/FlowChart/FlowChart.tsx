// src/features/IdeaMapper/mappers/FlowChart/FlowChart.tsx
import React from "react";
import ReactFlow, { Node, Edge, OnNodesChange, OnEdgesChange } from "reactflow";
import FlowNode from "./FlowNode";
import FlowEdge from "./FlowEdge";

interface FlowChartProps {
  nodes: Node<any>[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  nodeTypes: any;
  edgeTypes: any;
}

const FlowChart: React.FC<FlowChartProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  nodeTypes,
  edgeTypes,
}) => {
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      fitView
    />
  );
};

export default FlowChart;
