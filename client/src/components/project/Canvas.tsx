import React, { useState, useEffect } from "react";
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  applyEdgeChanges,
  applyNodeChanges,
} from "reactflow";
import axios from "axios";
import { io, Socket } from "socket.io-client";
import "reactflow/dist/style.css";
import { FaPlus } from "react-icons/fa";
import NodeModal from "../node/NodeModal";
import BasicNode from "../node/basicNode/BasicNode";
import AnnotationNode from "../node/annnotationNode/AnnotationNode";
import IdeaNode from "../node/ideaNode/IdeaNode";
import TaskNode from "../node/taskNode/TaskNode";
import ResourceNode from "../node/resourceNode/ResourceNode";

interface CanvasProps {
  projectId: string;
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

const Canvas: React.FC<CanvasProps> = ({ projectId }) => {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [showModal, setShowModal] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
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

  const onNodeChange = (nodeId: string, nodeData: any) => {
    socket?.emit("updateNode", { projectId, nodeId, nodeData });
  };

  const onEdgeChange = (edgeId: string, edgeData: any) => {
    socket?.emit("updateEdge", { projectId, edgeId, edgeData });
  };

  useEffect(() => {
    fetchProjectData();
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

  const onNodesChange = (changes) =>
    setNodes((nds) => applyNodeChanges(changes, nds));
  const onEdgesChange = (changes) =>
    setEdges((eds) => applyEdgeChanges(changes, eds));

  const onConnect = (connection) => setEdges((eds) => addEdge(connection, eds));

  const addEdge = (connection, edges) => {
    return [...edges, { ...connection }];
  };

  const handleCreateNode = (
    type: string,
    title: string,
    description: string
  ) => {
    const newNode = {
      id: `node-${nodes.length + 1}`,
      type,
      data: { label: title, description },
      position: { x: 0, y: 0 },
    };

    setNodes([...nodes, newNode]);
    setShowModal(false);
  };

  return (
    <div className="canvas">
      <button className="save-project-button" onClick={saveProject}>
        Save Project
      </button>
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
        <button
          className="create-node-button"
          onClick={() => setShowModal(true)}
        >
          <FaPlus /> Create Node
        </button>
      </ReactFlow>
      {showModal && (
        <NodeModal
          onSubmit={handleCreateNode}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default Canvas;
