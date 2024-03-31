// src/features/IdeaMapper/components/IdeaMapperCanvas.tsx
import React, { useCallback, useState, useMemo } from "react";
import ReactFlow, {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  Node,
} from "reactflow";
import "reactflow/dist/style.css";

import CustomNode from "./CustomNode";
import CustomEdge from "./CustomEdge";
import TreeMindMap from "../mappers/TreeMindMap/TreeMindMap";
import FlowChart from "../mappers/FlowChart/FlowChart";
import VisualCanvas from "../mappers/VisualCanvas/VisualCanvas";
import KeywordInput from "./KeywordInput";
import Toolbar from "./Toolbar";

const IdeaMapperCanvas: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [mapperType, setMapperType] = useState("tree");

  // Wrap CustomNode and CustomEdge with React.memo
  const MemoizedCustomNode = React.memo(CustomNode);
  const MemoizedCustomEdge = React.memo(CustomEdge);

  // Use the memoized components when defining nodeTypes and edgeTypes
  const nodeTypes = useMemo(() => ({ custom: MemoizedCustomNode }), []);
  const edgeTypes = useMemo(() => ({ custom: MemoizedCustomEdge }), []);

  const handleSave = useCallback(() => {
    localStorage.setItem("mindmap-nodes", JSON.stringify(nodes));
    localStorage.setItem("mindmap-edges", JSON.stringify(edges));
    alert("Mindmap saved successfully!");
  }, [nodes, edges]);

  const handleDelete = useCallback(() => {
    setNodes([]);
    setEdges([]);
    localStorage.removeItem("mindmap-nodes");
    localStorage.removeItem("mindmap-edges");
    alert("Mindmap deleted successfully!");
  }, [setNodes, setEdges]);

  React.useEffect(() => {
    const savedNodes = JSON.parse(
      localStorage.getItem("mindmap-nodes") || "[]"
    );
    const savedEdges = JSON.parse(
      localStorage.getItem("mindmap-edges") || "[]"
    );
    setNodes(savedNodes);
    setEdges(savedEdges);
  }, [setNodes, setEdges]);

  const handleExport = useCallback(() => {
    const svg = document.querySelector(".react-flow__renderer") as SVGElement;
    if (svg) {
      const serializer = new XMLSerializer();
      const source = serializer.serializeToString(svg);
      const blob = new Blob([source], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "mindmap.svg";
      link.click();
      URL.revokeObjectURL(url);
    }
  }, []);

  const handleExportJSON = useCallback(() => {
    const mindmap = { nodes, edges };
    const json = JSON.stringify(mindmap, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "mindmap.json";
    link.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges]);

  const handleAddNode = useCallback(() => {
    const newNode: Node = {
      id: `node-${nodes.length + 1}`,
      type: "custom",
      data: { label: "New Node" },
      position: { x: 0, y: 0 },
    };
    setNodes((prevNodes) => [...prevNodes, newNode]);
  }, [nodes]);

  const handleSelectMapperType = useCallback((type: string) => {
    setMapperType(type);
  }, []);

  const renderMapper = () => {
    switch (mapperType) {
      case "tree":
        return <TreeMindMap />;
      case "flow":
        return <FlowChart />;
      case "canvas":
        return <VisualCanvas />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen">
      <ReactFlowProvider>
        <div className="w-1/5 bg-white p-4">
          <Toolbar
            onSave={handleSave}
            onDelete={handleDelete}
            onExport={handleExport}
            onExportJSON={handleExportJSON}
            onAddNode={handleAddNode}
            onSelectMapperType={handleSelectMapperType}
          />
        </div>
        <div className="w-4/5">
          <div className="p-4">
            <KeywordInput />
          </div>
          {renderMapper()}
        </div>
      </ReactFlowProvider>
    </div>
  );
};

export default IdeaMapperCanvas;
