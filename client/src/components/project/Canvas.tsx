// client/src/components/project/Canvas.tsx
import React, { useState, useEffect } from "react";
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  applyEdgeChanges,
  applyNodeChanges,
  Connection,
  EdgeChange,
  NodeChange,
} from "reactflow";
import "reactflow/dist/style.css";
import IdeaNode from "../node/ideaNode/IdeaNode";
import TaskNode from "../node/taskNode/TaskNode";
import ResourceNode from "../node/resourceNode/ResourceNode";
import BasicNode from "../node/basicNode/BasicNode";
import AnnotationNode from "../node/annnotationNode/AnnotationNode";
import { io, Socket } from "socket.io-client";
import axios from "axios";

interface CanvasProps {
  projectId: string;
  nodes: Node[]; // Add this line
  edges: Edge[]; // Add this line if it's not already there
  onNodeUpdate: (nodeId: string, node: Node) => void;
  onEdgeUpdate: (edgeId: string, edge: Edge) => void;
}

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

const nodeTypes = {
  basic: BasicNode,
  idea: IdeaNode,
  task: TaskNode,
  resource: ResourceNode,
  annotation: AnnotationNode,
};

interface NodeUpdatePayload {
  nodeId: string;
  nodeData: NodeData; // Define NodeData based on what you expect here
}

interface EdgeUpdatePayload {
  edgeId: string;
  edgeData: EdgeData; // Define EdgeData based on what you expect here
}

// Assume NodeData and EdgeData are defined according to what the application uses
interface NodeData {
  label: string;
  type: string;
  // Add other node-specific properties here
}

interface EdgeData {
  sourceHandle?: string | null; // Allow `null` to match the Edge type from ReactFlow
  targetHandle?: string | null; // Allow `null`
  type?: string; // Any other properties used by edges in your application
}
const Canvas: React.FC<CanvasProps> = ({ projectId }) => {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    fetchProjectData();
    const newSocket = io("http://localhost:3001");
    setSocket(newSocket);

    newSocket.emit("joinProject", projectId);

    newSocket.on("nodeUpdated", (payload: NodeUpdatePayload) => {
      setNodes((prevNodes) =>
        prevNodes.map((node) =>
          node.id === payload.nodeId
            ? { ...node, data: payload.nodeData }
            : node
        )
      );
    });

    newSocket.on("edgeUpdated", (payload: EdgeUpdatePayload) => {
      setEdges((prevEdges) =>
        prevEdges.map((edge) =>
          edge.id === payload.edgeId ? { ...edge, ...payload.edgeData } : edge
        )
      );
    });

    return () => {
      newSocket.disconnect();
    };
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      const response = await axios.get(`/api/projects?id=${projectId}`);
      setNodes(response.data.nodes || []);
      setEdges(response.data.edges || []);
    } catch (error) {
      console.error("Error fetching project data:", error);
    }
  };

  const saveProject = async () => {
    try {
      await axios.put("/api/projects", {
        id: projectId,
        nodes,
        edges,
      });
      console.log("Project saved successfully");
    } catch (error) {
      console.error("Error saving project:", error);
    }
  };

  const onNodesChange = (changes: NodeChange[]) =>
    setNodes((nds) => applyNodeChanges(changes, nds));

  const onEdgesChange = (changes: EdgeChange[]) =>
    setEdges((eds) => applyEdgeChanges(changes, eds));

  const onConnect = (connection: Connection) =>
    setEdges((eds) => addEdge(connection, eds));

  const addEdge = (connection: Connection, edges: Edge[]): Edge[] => {
    if (!connection.source || !connection.target) {
      console.error("Invalid connection:", connection);
      return edges;
    }
    const newEdge: Edge = {
      id: `e-${connection.source}-${connection.target}`,
      source: connection.source,
      target: connection.target,
      sourceHandle: connection.sourceHandle ?? null,
      targetHandle: connection.targetHandle ?? null,
      type: "smoothstep",
    };
    return [...edges, newEdge];
  };

  const onNodeChange = (nodeId: string, nodeData: NodeData) => {
    socket?.emit("updateNode", { projectId, nodeId, nodeData });
  };

  const onEdgeChange = (edgeId: string, edgeData: Edge) => {
    // As Edge includes more data than just EdgeData, we should extract only the parts we need
    const { sourceHandle, targetHandle, type } = edgeData;
    // Prepare a payload that matches EdgeData
    const edgeUpdateData: EdgeData = {
      sourceHandle,
      targetHandle,
      type,
    };
    socket?.emit("updateEdge", { projectId, edgeId, edgeUpdateData });
  };

  return (
    <div className="canvas">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        onNodeDoubleClick={(_, node) => onNodeChange(node.id, node.data)}
        onEdgeDoubleClick={(_, edge) => onEdgeChange(edge.id, edge)}
      >
        <Background />
        <Controls />
      </ReactFlow>
      <button className="save-project-button" onClick={saveProject}>
        Save Project
      </button>
    </div>
  );
};

export default Canvas;
