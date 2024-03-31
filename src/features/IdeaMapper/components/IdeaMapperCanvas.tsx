// src/features/IdeaMapper/components/IdeaMapperCanvas.tsx
import React, { useCallback, useMemo, useState } from "react";
import ReactFlow, {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  Node,
} from "reactflow";
import "reactflow/dist/style.css";

import CustomNode from "./CustomNode";
import CustomEdge from "./CustomEdge";
import KeywordInput from "./KeywordInput";
import Toolbar from "./Toolbar";
import MapperOptions from "./MapperOptions";
import MapperRenderer from "./MapperRenderer";

const IdeaMapperCanvas: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [mapperType, setMapperType] = useState("tree");

  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);
  const edgeTypes = useMemo(() => ({ custom: CustomEdge }), []);

  const handleAddNode = useCallback(() => {
    const newNode: Node = {
      id: `node-${nodes.length + 1}`,
      type: "custom",
      data: { label: "New Node" },
      position: { x: 0, y: 0 },
    };
    setNodes((prevNodes) => [...prevNodes, newNode]);
  }, [nodes, setNodes]);

  const handleDeleteNode = useCallback(() => {
    if (selectedNode) {
      setNodes((prevNodes) =>
        prevNodes.filter((node) => node.id !== selectedNode)
      );
      setEdges((prevEdges) =>
        prevEdges.filter(
          (edge) => edge.source !== selectedNode && edge.target !== selectedNode
        )
      );
      setSelectedNode(null);
    }
  }, [selectedNode, setNodes, setEdges]);

  const handleSelectNode = useCallback((nodeId: string) => {
    setSelectedNode(nodeId);
  }, []);

  const handleMapperTypeChange = useCallback((type: string) => {
    setMapperType(type);
  }, []);

  return (
    <div className="flex h-screen">
      <ReactFlowProvider>
        <div className="w-1/5 bg-white p-4">
          <Toolbar
            onAddNode={handleAddNode}
            onDeleteNode={handleDeleteNode}
            onSelectNode={handleSelectNode}
          />
          <MapperOptions
            selectedType={mapperType}
            onTypeChange={handleMapperTypeChange}
          />
        </div>
        <div className="w-4/5">
          <div className="p-4">
            <KeywordInput />
          </div>
          <MapperRenderer
            mapperType={mapperType}
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
          />
        </div>
      </ReactFlowProvider>
    </div>
  );
};

export default IdeaMapperCanvas;
