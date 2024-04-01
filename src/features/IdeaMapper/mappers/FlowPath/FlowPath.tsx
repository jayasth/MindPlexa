// src/features/IdeaMapper/mappers/FlowPath/FlowPath.tsx
import React from "react";
import ReactFlow, { Node, Edge, OnNodesChange, OnEdgesChange } from "reactflow";
import FlowNode from "./FlowNode";
import FlowEdge from "./FlowEdge";

interface FlowPathProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onDelete: (nodeId: string) => void;
  nodeTypes?: any;
  edgeTypes?: any;
}

const FlowPath: React.FC<FlowPathProps> = ({
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

export default FlowPath;
