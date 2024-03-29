// src/components/IdeaMapper/IdeaMapperCanvasInner.tsx
import React, {
  useCallback,
  useRef,
  useState,
  useMemo,
  useEffect,
} from "react";
import { useRouter } from "next/router";
import ReactFlow, {
  useReactFlow,
  Controls,
  Background,
  MiniMap,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  ReactFlowInstance,
  Node,
  Edge,
} from "reactflow";
import "reactflow/dist/style.css";

import CustomNode from "./CustomNode";
import CustomEdge from "./CustomEdge";
import Toolbar from "./Toolbar";
import KeywordInput from "./KeywordInput";
import StylePanel from "./StylePanel";
import { saveIdeaToVault } from "../../../api/ideaVaultApi";

interface IdeaMapperCanvasInnerProps {
  onLoad: (instance: ReactFlowInstance) => void;
  reactFlowRef: React.RefObject<ReactFlowInstance>;
  nodeTypes: any;
  edgeTypes: any;
}

const IdeaMapperCanvasInner: React.FC<IdeaMapperCanvasInnerProps> = ({
  onLoad,
  reactFlowRef,
  nodeTypes,
  edgeTypes,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [nodeStyle, setNodeStyle] = useState<{ backgroundColor?: string }>({});
  const [edgeStyle, setEdgeStyle] = useState<{ stroke?: string }>({});
  const [history, setHistory] = useState<{ nodes: Node[]; edges: Edge[] }[]>(
    []
  );
  const [redoHistory, setRedoHistory] = useState<
    { nodes: Node[]; edges: Edge[] }[]
  >([]);

  const { project, zoomIn, zoomOut } = useReactFlow();
  const router = useRouter();

  const handleSaveToVault = useCallback(async () => {
    const flow = reactFlowRef.current?.toObject();
    if (flow) {
      try {
        await saveIdeaToVault(flow);
        router.push("/agents/IdeaVault");
      } catch (error) {
        console.error("Error saving idea to vault:", error);
      }
    }
  }, [reactFlowRef, router]);

  useEffect(() => {
    const savedNodes = JSON.parse(localStorage.getItem("nodes") || "[]");
    const savedEdges = JSON.parse(localStorage.getItem("edges") || "[]");
    setNodes(savedNodes);
    setEdges(savedEdges);
  }, [setEdges, setNodes]);

  useEffect(() => {
    localStorage.setItem("nodes", JSON.stringify(nodes));
    localStorage.setItem("edges", JSON.stringify(edges));
  }, [nodes, edges]);

  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdges = addEdge(connection, edges);
      setEdges(newEdges);
    },
    [edges, setEdges]
  );

  const handleKeywordSubmit = async (keyword: string) => {
    try {
      const response = await fetch("/api/generate-nodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword }),
      });
      const generatedNodes = await response.json();

      setNodes((prevNodes) => [...prevNodes, ...generatedNodes]);
    } catch (error) {
      console.error("Error generating nodes:", error);
    }
  };

  const handleNodeStyleChange = (style: any) => {
    setNodeStyle(style);
  };

  const handleEdgeStyleChange = (style: any) => {
    setEdgeStyle(style);
  };

  const handleAddNode = (label: string) => {
    const newNode = {
      id: `${nodes.length + 1}`,
      type: "custom",
      position: project({ x: 0, y: 0 }),
      data: { label, backgroundColor: nodeStyle.backgroundColor },
    };
    setHistory([...history, { nodes, edges }]);
    setNodes((nds) => nds.concat(newNode));
  };

  const handleDeleteNode = (nodeId: string) => {
    setHistory([...history, { nodes, edges }]);
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) =>
      eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
    );
  };

  const handleEditNode = (nodeId: string, label: string) => {
    setHistory([...history, { nodes, edges }]);
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, label } } : node
      )
    );
  };

  const handleAddEdge = (newEdge: Edge) => {
    setHistory([...history, { nodes, edges }]);
    setEdges((eds) => addEdge(newEdge, eds));
  };

  const handleDeleteEdge = (edgeId: string) => {
    setHistory([...history, { nodes, edges }]);
    setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previousState = history[history.length - 1];
    setRedoHistory([...redoHistory, { nodes, edges }]);
    setNodes(previousState.nodes);
    setEdges(previousState.edges);
    setHistory(history.slice(0, history.length - 1));
  };

  const handleRedo = () => {
    if (redoHistory.length === 0) return;
    const nextState = redoHistory[redoHistory.length - 1];
    setHistory([...history, { nodes, edges }]);
    setNodes(nextState.nodes);
    setEdges(nextState.edges);
    setRedoHistory(redoHistory.slice(0, redoHistory.length - 1));
  };

  const handleDelete = () => {
    setHistory([...history, { nodes, edges }]);
    setNodes([]);
    setEdges([]);
  };

  const handleAutoArrange = () => {
    // Implement auto-arrange logic here
  };

  const handleExport = () => {
    if (reactFlowRef.current) {
      const flow = reactFlowRef.current.toObject();
      const json = JSON.stringify(flow);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "mind-map.json";
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="flex-container">
      <div className="sidebar">
        <div className="toolbar">
          <StylePanel
            onNodeStyleChange={handleNodeStyleChange}
            onEdgeStyleChange={handleEdgeStyleChange}
          />
          <hr className="my-2" />
          <Toolbar
            onSaveToVault={handleSaveToVault}
            onAddNode={handleAddNode}
            onDeleteNode={handleDeleteNode}
            onEditNode={handleEditNode}
            onAddEdge={handleAddEdge}
            onDeleteEdge={handleDeleteEdge}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onExport={handleExport}
            onAutoArrange={handleAutoArrange}
          />
        </div>
      </div>
      <div className="flex-grow">
        <ReactFlowProvider>
          <div className="flex-container flex-direction-column">
            <div className="p-4">
              <KeywordInput onSubmit={handleKeywordSubmit} />
            </div>
            <div className="flex-grow">
              <ReactFlow
                onLoad={onLoad as any}
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                defaultEdgeOptions={{
                  type: "custom",
                  data: { stroke: edgeStyle.stroke },
                }}
                fitView
                attributionPosition="top-right"
                minZoom={0.2}
                maxZoom={2}
              >
                <Background color="#aaa" gap={16} />
                <Controls />
                <MiniMap
                  nodeStrokeColor={(n) => {
                    if (n.type === "custom")
                      return nodeStyle.backgroundColor || "#ff0000";
                    return "#0041d0";
                  }}
                  nodeColor={(n) => {
                    if (n.type === "custom")
                      return nodeStyle.backgroundColor || "#ff0000";
                    return "#0041d0";
                  }}
                />
              </ReactFlow>
            </div>
          </div>
        </ReactFlowProvider>
        <button
          onClick={handleSaveToVault}
          className="absolute bottom-4 right-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Save to Idea Vault
        </button>
      </div>
    </div>
  );
};

export default IdeaMapperCanvasInner;
