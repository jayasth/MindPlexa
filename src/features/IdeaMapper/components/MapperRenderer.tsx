// src/features/IdeaMapper/components/MapperRenderer.tsx
import React from "react";
import TreeOfThoughts from "../mappers/FlowPath/TreeOfThoughts";
import FlowPath from "../mappers/FlowPath/FlowPath";
import DecisionWeb from "../mappers/DecisionWeb/DecisionWeb";
import ReactFlow, { Node, Edge } from "reactflow";

interface MapperRendererProps {
  mapperType: string;
  nodes: Node<any>[]; // Updated type
  edges: Edge[];
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  nodeTypes: any;
  edgeTypes: any;
}

const MapperRenderer: React.FC<MapperRendererProps> = ({
  mapperType,
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  nodeTypes,
  edgeTypes,
}) => {
  switch (mapperType) {
    case "tree":
      return (
        <TreeOfThoughts
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
        />
      );
    case "flow":
      return (
        <FlowPath
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
        />
      );
    case "canvas":
      return (
        <DecisionWeb
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
        />
      );
    default:
      return null;
  }
};

export default MapperRenderer;
