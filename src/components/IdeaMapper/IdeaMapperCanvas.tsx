// src/components/IdeaMapper/IdeaMapperCanvas.tsx

import React, { useCallback, useRef, useState, useMemo } from "react";
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

  const { project } = useReactFlow();

  // Add history state for undo/redo functionality
  const [history, setHistory] = useState<
    { nodes: Node<any>[]; edges: Edge<any>[] }[]
  >([]);
  const [redoHistory, setRedoHistory] = useState<
    { nodes: Node<any>[]; edges: Edge<any>[] }[]
  >([]);

  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdges = addEdge(connection, edges);
      setHistory([...history, { nodes, edges }]); // Save current state to history before updating
      setEdges(newEdges);
    },
    [edges, history, nodes]
  );

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

  const handleKeywordsChange = async (keyword: string) => {
    try {
      // Generate related keywords using GPT-3.5-turbo API
      const relatedKeywords = await generateRelatedKeywords(keyword);

      // Add new nodes for each related keyword
      const newNodes = relatedKeywords.map(
        (keyword: string, index: number) => ({
          id: `${nodes.length + index + 1}`,
          type: "custom",
          position: project({ x: Math.random() * 500, y: Math.random() * 500 }),
          data: { label: keyword, backgroundColor: nodeStyle.backgroundColor },
        })
      );

      setNodes((nds) => [...nds, ...newNodes]);
    } catch (error) {
      console.error("Error generating related keywords:", error);
      // Handle error and display message to the user
    }
  };

  const handleNodeStyleChange = (style: any) => {
    setNodeStyle(style);
  };

  const handleEdgeStyleChange = (style: any) => {
    setEdgeStyle(style);
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

  // Helper function to generate related keywords using GPT-3.5-turbo API
  const generateRelatedKeywords = async (
    keyword: string
  ): Promise<string[]> => {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are an assistant that generates related keywords for a given keyword or topic. Provide the related keywords as a comma-separated list.",
          },
          {
            role: "user",
            content: `Generate related keywords for the following: ${keyword}`,
          },
        ],
        max_tokens: 50,
        n: 1,
        stop: null,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const generatedText = data.choices[0].message.content.trim();
    const relatedKeywords = generatedText
      .split(",")
      .map((keyword: string) => keyword.trim());

    return relatedKeywords;
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
              <KeywordInput onKeywordChange={handleKeywordsChange} />
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
      </div>
    </div>
  );
};

export default IdeaMapperCanvas;
