import React, { useCallback, useMemo } from "react";
import ReactFlow, {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";

import CustomNode from "./CustomNode";
import CustomEdge from "./CustomEdge";
import IdeaMapperCanvasInner from "./IdeaMapperCanvasInner";
import KeywordInput from "./KeywordInput";
import Toolbar from "./Toolbar";

const IdeaMapperCanvas: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

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

  return (
    <div className="flex h-screen">
      <ReactFlowProvider>
        <div className="w-1/5 bg-white p-4">
          <Toolbar
            onSave={handleSave}
            onDelete={handleDelete}
            onExport={handleExport}
            onExportJSON={handleExportJSON}
          />
        </div>
        <div className="w-4/5">
          <div className="p-4">
            <KeywordInput />
          </div>
          <IdeaMapperCanvasInner
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            mindmapId="1" // Pass an empty string or provide a valid mindmapId
            userId="test" // Pass an empty string or provide a valid userId
          />
        </div>
      </ReactFlowProvider>
    </div>
  );
};

export default IdeaMapperCanvas;
