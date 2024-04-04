import React from "react";
import ReactFlow, { Node, Edge, OnNodesChange, OnEdgesChange } from "reactflow";
import DecisionNode from "./DecisionNode";
import DecisionEdge from "./DecisionEdge";

interface DecisionWebProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onDelete: (nodeId: string) => void;
  nodeTypes?: any;
  edgeTypes?: any;
}

const DecisionWeb: React.FC<DecisionWebProps> = ({
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

export default DecisionWeb;
