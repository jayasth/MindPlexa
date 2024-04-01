// src/features/IdeaMapper/components/IdeaMapperCanvas.tsx
import React, { useCallback, useMemo, useState } from "react";
import ReactFlow, {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  Node as ReactFlowNode,
} from "reactflow";
import "reactflow/dist/style.css";

import CustomNode from "./CustomNode";
import CustomEdge from "./CustomEdge";
import KeywordInput from "./KeywordInput";
import Toolbar from "./Toolbar";
import MapperRenderer from "./MapperRenderer";
import AIAssistantModal from "./AIAssistantModal";

const IdeaMapperCanvas: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [mapperType, setMapperType] = useState("tree");
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);
  const edgeTypes = useMemo(() => ({ custom: CustomEdge }), []);

  const handleAddNode = useCallback(() => {
    const newNode: ReactFlowNode = {
      id: `node-${nodes.length + 1}`,
      type: "custom",
      data: { label: "New Node" },
      position: { x: 0, y: 0 },
      draggable: true,
    };
    setNodes((prevNodes) => [...prevNodes, newNode]);
  }, [nodes, setNodes]);

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((prevNodes) => prevNodes.filter((node) => node.id !== nodeId));
      setEdges((prevEdges) =>
        prevEdges.filter(
          (edge) => edge.source !== nodeId && edge.target !== nodeId
        )
      );
      setSelectedNode(null);
    },
    [setNodes, setEdges]
  );

  const handleSelectNode = useCallback((nodeId: string) => {
    setSelectedNode(nodeId);
  }, []);

  const handleMapperTypeChange = useCallback((type: string) => {
    setMapperType(type);
  }, []);

  const handleOpenAIModal = useCallback(() => {
    setIsAIModalOpen(true);
  }, []);

  const handleCloseAIModal = useCallback(() => {
    setIsAIModalOpen(false);
  }, []);

  const handleSuggestionAccepted = useCallback(
    (suggestion: string) => {
      if (selectedNode) {
        setNodes((prevNodes) =>
          prevNodes.map((node) =>
            node.id === selectedNode
              ? {
                  ...node,
                  data: {
                    ...node.data,
                    label: suggestion,
                  },
                }
              : node
          )
        );
      }
    },
    [selectedNode, setNodes]
  );

  return (
    <div className="flex h-screen">
      <ReactFlowProvider>
        <div className="w-1/5 bg-white p-4">
          <Toolbar
            onAddNode={handleAddNode}
            onDeleteNode={handleDeleteNode}
            onSelectNode={handleSelectNode}
            onOpenAIModal={handleOpenAIModal}
            selectedNode={selectedNode}
            onMapperTypeChange={handleMapperTypeChange}
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
            onDelete={handleDeleteNode}
          />
        </div>
      </ReactFlowProvider>
      {isAIModalOpen && selectedNode && (
        <AIAssistantModal
          nodeId={selectedNode}
          nodeLabel={
            nodes.find((node) => node.id === selectedNode)?.data.label || ""
          }
          onClose={handleCloseAIModal}
          onSuggestionAccepted={handleSuggestionAccepted}
        />
      )}
    </div>
  );
};

export default IdeaMapperCanvas;
