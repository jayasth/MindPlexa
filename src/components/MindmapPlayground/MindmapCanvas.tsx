import React, {
  useCallback,
  useRef,
  useState,
  KeyboardEvent,
  useEffect,
  TouchEvent,
} from "react";
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
  applyNodeChanges,
  applyEdgeChanges,
  getLayoutedElements,
  LayoutOptions,
} from "reactflow";
import "reactflow/dist/style.css";

import Toolbar from "./Toolbar";
import CustomNode from "./NodeStyles";
import CustomEdge from "./EdgeStyles";
import { getSocket } from "../../lib/socket";

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

  const handleLabelChange = (nodeId: string, newLabel: string) => {
    setNodes((els) =>
      els.map((el) =>
        el.id === nodeId ? { ...el, data: { ...el.data, label: newLabel } } : el
      )
    );
  };

  const nodeTypes = {
    custom: (props) => (
      <CustomNode {...props} handleLabelChange={handleLabelChange} />
    ),
  };

  const edgeTypes = {
    custom: CustomEdge,
  };

  const handleExport = () => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();
      const json = JSON.stringify(flow);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "mindmap.json";
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleImport = async (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const json = event.target?.result as string;
      const flow = JSON.parse(json);
      if (reactFlowInstance) {
        reactFlowInstance.setNodes(flow.nodes);
        reactFlowInstance.setEdges(flow.edges);
      }
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    const socket = getSocket();

    if (socket) {
      socket.on("mindmapChanges", (changes) => {
        // Apply the received changes to the mindmap
        setNodes((nds) => applyNodeChanges(changes.nodeChanges, nds));
        setEdges((eds) => applyEdgeChanges(changes.edgeChanges, eds));
      });
    }

    return () => {
      if (socket) {
        socket.off("mindmapChanges");
      }
    };
  }, [setEdges, setNodes]);

  const onConnect = useCallback(
    (params: Edge | Connection) => {
      setEdges((eds) => addEdge(params, eds));
      // Emit the edge changes to the server
      getSocket()?.emit("mindmapChanges", {
        nodeChanges: [],
        edgeChanges: [{ type: "add", item: params }],
      });
    },
    [setEdges]
  );

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    if (event.touches.length === 2) {
      event.preventDefault();
    }
  };

  const handleTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    if (event.touches.length === 2) {
      event.preventDefault();
    }
  };

  const handleAddNode = () => {
    const newNode: Node<NodeData> = {
      id: `${nodes.length + 1}`,
      type: "custom",
      data: { label: `Node ${nodes.length + 1}`, link: "" },
      position: { x: 100, y: 100 },
    };
    setNodes((nds) => nds.concat(newNode));
    getSocket()?.emit("mindmapChanges", {
      nodeChanges: [{ type: "add", item: newNode }],
      edgeChanges: [],
    });
  };

  const handleDeleteSelectedNode = () => {
    setNodes((nds) => nds.filter((node) => !node.selected));
    setHistory((prevHistory) => [
      ...prevHistory.slice(0, historyIndex + 1),
      { nodes, edges },
    ]);
    setHistoryIndex((prevIndex) => prevIndex + 1);
    // Emit the node changes to the server
    getSocket()?.emit("mindmapChanges", {
      nodeChanges: nodes
        .filter((node) => node.selected)
        .map((node) => ({ type: "remove", id: node.id })),
      edgeChanges: [],
    });
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

  const handleAutoArrange = () => {
    if (reactFlowInstance) {
      const layoutOptions: LayoutOptions = {
        "elk.algorithm": "layered",
        "elk.direction": "RIGHT",
        "elk.spacing.nodeNode": "100",
        "elk.spacing.nodeEdge": "50",
        "elk.layered.spacing.nodeNodeBetweenLayers": "100",
        "elk.layered.spacing.edgeEdgeBetweenLayers": "50",
        "elk.layered.spacing.edgeNodeBetweenLayers": "50",
        "elk.layered.mergeEdges": "true",
        "elk.layered.mergeHierarchyEdges": "true",
      };

      const { nodes: layoutedNodes, edges: layoutedEdges } =
        getLayoutedElements(nodes, edges, layoutOptions);

      reactFlowInstance.setNodes(layoutedNodes);
      reactFlowInstance.setEdges(layoutedEdges);
    }
  };

  return (
    <div
      className="flex flex-col h-full md:flex-row"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
      <div className="w-full md:w-60 bg-gray-200 p-4">
        <Toolbar
          onAddNode={handleAddNode}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onExport={handleExport}
          onImport={handleImport}
          onAutoArrange={handleAutoArrange}
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
