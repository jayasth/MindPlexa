import React, { useCallback, useEffect, useMemo, useState } from "react";
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  Connection,
  Edge,
  Node,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";

import CustomNode from "./CustomNode";
import CustomEdge from "./CustomEdge";
import KeywordInput from "./KeywordInput";
import Toolbar from "./Toolbar";
import MapperRenderer from "./MapperRenderer";
import AIAssistantModal from "./AIAssistantModal";
import { supabase } from "../../../utils/supabaseClient";
import useTheme from "../../../hooks/useTheme";

const IdeaMapperCanvas: React.FC = () => {
  const { theme } = useTheme();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [mapperType, setMapperType] = useState("tree");
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  const userId = "user-id-placeholder";

  const saveMindmapToSupabase = useCallback(
    async (nodesToSave: Node[], edgesToSave: Edge[]) => {
      const { data, error } = await supabase
        .from("mindmaps")
        .insert({ user_id: userId, nodes: nodesToSave, edges: edgesToSave });

      if (error) {
        console.error("Error saving mindmap:", error);
      }
    },
    [userId]
  );

  useEffect(() => {
    saveMindmapToSupabase(nodes, edges);
  }, [nodes, edges, saveMindmapToSupabase]);

  useEffect(() => {
    const fetchMindmaps = async () => {
      const { data, error } = await supabase
        .from("mindmaps")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Error fetching mindmaps:", error);
      } else {
        setNodes(data.nodes || []);
        setEdges(data.edges || []);
      }
    };

    fetchMindmaps();
  }, [userId, setNodes, setEdges]);

  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);
  const edgeTypes = useMemo(() => ({ custom: CustomEdge }), []);

  const handleAddNode = useCallback(() => {
    const newNode: Node = {
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
      const newNodes = nodes.filter((node) => node.id !== nodeId);
      const newEdges = edges.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId
      );
      setNodes(newNodes);
      setEdges(newEdges);
      setSelectedNode(null);
      saveMindmapToSupabase(newNodes, newEdges);
    },
    [nodes, setNodes, edges, setEdges, saveMindmapToSupabase]
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
    <div className={`flex h-screen ${theme === "dark" ? "bg-gray-800" : ""}`}>
      <ReactFlowProvider>
        <div
          className={`w-1/5 p-4 ${
            theme === "dark" ? "bg-gray-900" : "bg-white"
          }`}
        >
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
