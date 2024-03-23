import React, { useCallback, useRef, useState, KeyboardEvent } from "react";
import ReactFlow, {
  Controls,
  Background,
  Node,
  Edge,
  ConnectionMode,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  ReactFlowInstance,
} from "reactflow";
import "reactflow/dist/style.css";

import Toolbar from "./Toolbar";
import CustomNode from "./NodeStyles";
import CustomEdge from "./EdgeStyles";

const nodeTypes = {
  custom: CustomNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

const initialNodes: Node[] = [
  {
    id: "1",
    type: "custom",
    data: { label: "Node 1" },
    position: { x: 250, y: 0 },
  },
];

const MindmapCanvas: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [history, setHistory] = useState<{ nodes: Node[]; edges: Edge[] }[]>([
    { nodes: initialNodes, edges: [] },
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);

  const onConnect = useCallback(
    (params: Edge | Connection) => {
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges]
  );

  const handleAddNode = () => {
    const newNode: Node = {
      id: `${nodes.length + 1}`,
      type: "custom",
      data: { label: `Node ${nodes.length + 1}` },
      position: { x: 100, y: 100 },
    };
    setNodes((nds) => nds.concat(newNode));
    setHistory((prevHistory) => [
      ...prevHistory.slice(0, historyIndex + 1),
      { nodes, edges },
    ]);
    setHistoryIndex((prevIndex) => prevIndex + 1);
  };

  const handleDeleteSelectedNode = () => {
    setNodes((nds) => nds.filter((node) => !node.selected));
    setHistory((prevHistory) => [
      ...prevHistory.slice(0, historyIndex + 1),
      { nodes, edges },
    ]);
    setHistoryIndex((prevIndex) => prevIndex + 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setNodes(history[historyIndex - 1].nodes);
      setEdges(history[historyIndex - 1].edges);
      setHistoryIndex((prevIndex) => prevIndex - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setNodes(history[historyIndex + 1].nodes);
      setEdges(history[historyIndex + 1].edges);
      setHistoryIndex((prevIndex) => prevIndex + 1);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.ctrlKey && event.key === "a") {
      event.preventDefault();
      handleAddNode();
    } else if (event.key === "Delete") {
      event.preventDefault();
      handleDeleteSelectedNode();
    }
  };

  return (
    <div className="flex h-full" onKeyDown={handleKeyDown} tabIndex={0}>
      <div className="w-60 bg-gray-200 p-4">
        <Toolbar
          onAddNode={handleAddNode}
          onUndo={handleUndo}
          onRedo={handleRedo}
        />
      </div>
      <div ref={reactFlowWrapper} className="flex-1 overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          connectionMode={ConnectionMode.Loose}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          className="h-full"
          onInit={setReactFlowInstance}
        >
          <Background color="#aaa" gap={16} />
          <Controls className="controls" />
        </ReactFlow>
      </div>
    </div>
  );
};

export default MindmapCanvas;
