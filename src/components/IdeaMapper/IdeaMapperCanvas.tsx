// src/components/IdeaMapper/IdeaMapperCanvas.tsx

import React, { useCallback, useMemo } from "react";
import ReactFlow, {
  Controls,
  Background,
  MiniMap,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
} from "reactflow";
import "reactflow/dist/style.css";

import CustomNode from "../IdeaMapperPlayground/NodeStyles";
import CustomEdge from "../IdeaMapperPlayground/EdgeStyles";
import Toolbar from "../IdeaMapperPlayground/Toolbar";
import KeywordInput from "./KeywordInput";

const IdeaMapperCanvas: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);
  const edgeTypes = useMemo(() => ({ custom: CustomEdge }), []);

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    []
  );

  const handleAddNode = () => {
    const newNode = {
      id: `${nodes.length + 1}`,
      type: "custom",
      position: { x: 100, y: 100 },
      data: { label: `Node ${nodes.length + 1}` },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const handleGenerateRelatedWords = async (keyword: string) => {
    try {
      const response = await fetch(
        `https://api.datamuse.com/words?rel_trg=${encodeURIComponent(keyword)}`
      );
      const data = await response.json();

      console.log("API Response:", data);

      const relatedWords = data
        .slice(0, 5)
        .map((item: { word: string }) => item.word);

      console.log("Related Words:", relatedWords);

      const newNodes = relatedWords.map((word: string, index: number) => ({
        id: `${nodes.length + index + 1}`,
        type: "custom",
        position: { x: 100 + index * 200, y: 100 },
        data: { label: word },
      }));

      setNodes((nds) => [...nds, ...newNodes]);
    } catch (error) {
      console.error("Error fetching related words:", error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <ReactFlowProvider>
        <KeywordInput onGenerateRelatedWords={handleGenerateRelatedWords} />
        <Toolbar
          onAddNode={handleAddNode}
          onUndo={() => {}}
          onRedo={() => {}}
          onExport={() => {}}
          onAutoArrange={() => {}}
          onImport={function (): void {
            throw new Error("Function not implemented.");
          }}
        />
        <div className="flex-grow" style={{ width: "100%", height: "600px" }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            attributionPosition="top-right"
          >
            <Background color="#aaa" gap={16} />
            <Controls />
            <MiniMap
              nodeStrokeColor={(n) => {
                if (n.type === "custom") return "#ff0000";
                return "#0041d0";
              }}
              nodeColor={(n) => {
                if (n.type === "custom") return "#ff0000";
                return "#0041d0";
              }}
            />
          </ReactFlow>
        </div>
      </ReactFlowProvider>
    </div>
  );
};

export default IdeaMapperCanvas;
