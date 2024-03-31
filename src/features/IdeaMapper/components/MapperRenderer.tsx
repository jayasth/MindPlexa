// src/features/IdeaMapper/components/MapperRenderer.tsx
import React from "react";
import TreeMindMap from "../mappers/TreeMindMap/TreeMindMap";
import FlowChart from "../mappers/FlowChart/FlowChart";
import VisualCanvas from "../mappers/VisualCanvas/VisualCanvas";
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
        <TreeMindMap
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
        <FlowChart
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
        <VisualCanvas
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
