// src/components/IdeaMapper/IdeaMapperCanvas.tsx
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
import { saveIdeaToVault } from "../../api/ideaVaultApi";

const IdeaMapperCanvas: React.FC = () => {
  const reactFlowRef = useRef<ReactFlowInstance | null>(null);

  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);
  const edgeTypes = useMemo(() => ({ custom: CustomEdge }), []);

  const onLoad = useCallback((instance: ReactFlowInstance) => {
    reactFlowRef.current = instance;
  }, []);

  return (
    <ReactFlowProvider>
      <IdeaMapperCanvasInner
        onLoad={onLoad}
        reactFlowRef={reactFlowRef}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
      />
    </ReactFlowProvider>
  );
};

const IdeaMapperCanvasInner: React.FC<{
  onLoad: (instance: ReactFlowInstance) => void;
  reactFlowRef: React.RefObject<ReactFlowInstance>;
  nodeTypes: any;
  edgeTypes: any;
}> = ({ onLoad, reactFlowRef, nodeTypes, edgeTypes }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [nodeStyle, setNodeStyle] = useState<{ backgroundColor?: string }>({});
  const [edgeStyle, setEdgeStyle] = useState<{ stroke?: string }>({});

  // Define history and redoHistory states
  const [history, setHistory] = useState<{ nodes: Node[]; edges: Edge[] }[]>(
    []
  );
  const [redoHistory, setRedoHistory] = useState<
    { nodes: Node[]; edges: Edge[] }[]
  >([]);

  const { project } = useReactFlow();

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

  // Load saved mind map data from local storage or API
  useEffect(() => {
    const savedNodes = JSON.parse(localStorage.getItem("nodes") || "[]");
    const savedEdges = JSON.parse(localStorage.getItem("edges") || "[]");
    setNodes(savedNodes);
    setEdges(savedEdges);
  }, [setEdges, setNodes]);

  // Save mind map data to local storage or API whenever it changes
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
      // Make an API request to generate related nodes using AI
      const response = await fetch("/api/generate-nodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword }),
      });
      const generatedNodes = await response.json();

      // Add the generated nodes to the mind map
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
    setHistory([...history, { nodes, edges }]); // Save current state to history before updating
    setNodes((nds) => nds.concat(newNode));
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previousState = history[history.length - 1];
    setRedoHistory([...redoHistory, { nodes, edges }]); // Save current state to redo history before undoing
    setNodes(previousState.nodes);
    setEdges(previousState.edges);
    setHistory(history.slice(0, history.length - 1));
  };

  const handleRedo = () => {
    if (redoHistory.length === 0) return;
    const nextState = redoHistory[redoHistory.length - 1];
    setHistory([...history, { nodes, edges }]); // Save current state to history before redoing
    setNodes(nextState.nodes);
    setEdges(nextState.edges);
    setRedoHistory(redoHistory.slice(0, redoHistory.length - 1));
  };

  const handleDelete = () => {
    setHistory([...history, { nodes, edges }]); // Save current state to history before deleting
    setNodes([]);
    setEdges([]);
  };

  const handleZoomIn = () => {
    reactFlowRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    reactFlowRef.current?.zoomOut();
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
    <div className="flex h-screen">
      <div className="w-16 bg-white p-2">
        <div className="flex flex-col space-y-2">
          <StylePanel
            onNodeStyleChange={handleNodeStyleChange}
            onEdgeStyleChange={handleEdgeStyleChange}
          />
          <hr className="my-2" />
          <Toolbar
            onAddNode={handleAddNode}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onExport={handleExport}
            onDelete={handleDelete}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onAutoArrange={handleAutoArrange}
          />
        </div>
      </div>
      <div className="flex-grow bg-gray-100">
        <ReactFlowProvider>
          <div className="flex flex-col h-full">
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

export default IdeaMapperCanvas;
