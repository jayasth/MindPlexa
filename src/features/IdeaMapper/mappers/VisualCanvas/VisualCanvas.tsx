// src/features/IdeaMapper/mappers/VisualCanvas/VisualCanvas.tsx
import React, { useCallback } from "react";
import ReactFlow, {
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
} from "reactflow";
import VisualNode from "./VisualNode";
import VisualEdge from "./VisualEdge";

const VisualCanvas: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const nodeTypes = {
    visualNode: VisualNode,
  };

  const edgeTypes = {
    visualEdge: VisualEdge,
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

export default VisualCanvas;
