import React from "react";
import TreeOfThoughts from "../../../../../src/mappers/TreeOfThoughts/TreeOfThoughts";
import FlowPath from "../../../../../src/mappers/FlowPath/FlowPath";
import DecisionWeb from "../../../../../src/mappers/DecisionWeb/DecisionWeb";
import ReactFlow, { Node, Edge, OnNodesChange, OnEdgesChange } from "reactflow";

interface MapperRendererProps {
  mapperType: string;
  nodes: Node<any>[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  nodeTypes: any;
  edgeTypes: any;
  onDelete: (nodeId: string) => void;
}

const MapperRenderer: React.FC<MapperRendererProps> = ({
  mapperType,
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  nodeTypes,
  edgeTypes,
  onDelete,
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
          onDelete={onDelete}
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
          onDelete={onDelete}
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
          onDelete={onDelete}
        />
      );
    default:
      return null;
  }
};
export default MapperRenderer;
