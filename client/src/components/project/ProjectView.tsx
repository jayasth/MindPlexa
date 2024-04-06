import React, { useState, useEffect } from "react";
import { Node, Edge } from "reactflow";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import Canvas from "./Canvas";
import Generator from "../ai/generator/Generator";
import Connector from "../ai/connector/Connector";
import Organizer from "../ai/organizer/Organizer";
import IntegrationHub from "./integrationHub/IntegrationHub";
import ExperimentLab from "./experimentLab/ExperimentLab";
import ProjectSidebar from "./ProjectSidebar";
import Comments from "./Comments";
import History from "./History";
import Search from "./Search";
import ExportImport from "./ExportImport";
import Tasks from "./Tasks";
import BrainstormingSessions from "./BrainstormingSessions";
import ProjectInsights from "./ProjectInsights";
import ProjectMilestones from "./ProjectMilestones";

interface ProjectViewProps {
  projectId: string;
}

const ProjectView: React.FC<ProjectViewProps> = ({ projectId }) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [activeView, setActiveView] = useState("canvas");
  const [searchResults, setSearchResults] = useState<Node[]>([]);

  useEffect(() => {
    const newSocket = io("http://localhost:3000");
    setSocket(newSocket);

    newSocket.emit("joinProject", projectId);

    newSocket.on("nodeChanged", (data: { nodeId: string; changes: any }) => {
      setNodes((prevNodes) =>
        prevNodes.map((node) =>
          node.id === data.nodeId ? { ...node, ...data.changes } : node
        )
      );
    });
    newSocket.on("edgeChanged", (data: { edgeId: string; changes: any }) => {
      setEdges((prevEdges) =>
        prevEdges.map((edge) =>
          edge.id === data.edgeId ? { ...edge, ...data.changes } : edge
        )
      );
    });

    newSocket.on("edgeUpdated", (data: { edgeId: string; edge: Edge }) => {
      setEdges((prevEdges) =>
        prevEdges.map((edge) =>
          edge.id === data.edgeId ? { ...edge, ...data.edge } : edge
        )
      );
    });

    newSocket.on("nodeAdded", (data: { node: Node }) => {
      setNodes((prevNodes) => [...prevNodes, data.node]);
    });

    newSocket.on("edgeAdded", (data: { edge: Edge }) => {
      setEdges((prevEdges) => [...prevEdges, data.edge]);
    });

    newSocket.on("nodeDeleted", (data: { nodeId: string }) => {
      setNodes((prevNodes) =>
        prevNodes.filter((node) => node.id !== data.nodeId)
      );
    });

    newSocket.on("edgeDeleted", (data: { edgeId: string }) => {
      setEdges((prevEdges) =>
        prevEdges.filter((edge) => edge.id !== data.edgeId)
      );
    });

    return () => {
      newSocket.emit("leaveProject", projectId);
      newSocket.disconnect();
    };
  }, [projectId]);

  const handleGenerateIdea = () => {
    console.log("Generating idea...");
  };

  const handleConnectNodes = () => {
    console.log("Connecting nodes...");
  };

  const handleOrganizeNodes = () => {
    console.log("Organizing nodes...");
  };

  const handleNodeChange = (nodeId: string, changes: any) => {
    setNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.id === nodeId ? { ...node, ...changes } : node
      )
    );

    socket?.emit("nodeChange", { projectId, nodeId, changes });
  };

  const handleEdgeChange = (edgeId: string, changes: any) => {
    setEdges((prevEdges) =>
      prevEdges.map((edge) =>
        edge.id === edgeId ? { ...edge, ...data.changes } : edge
      )
    );

    socket?.emit("edgeChange", { projectId, edgeId, changes });
  };

  const handleViewChange = (view: string) => {
    setActiveView(view);
  };

  const handleSearch = async (query: string) => {
    try {
      const response = await axios.get(
        `/api/projects/${projectId}/search?q=${query}`
      );
      setSearchResults(response.data);
    } catch (error) {
      console.error("Error searching project:", error);
    }
  };

  const handleImportProject = (nodes: Node[], edges: Edge[]) => {
    // Update the project state with the imported nodes and edges
    setNodes(nodes);
    setEdges(edges);
  };

  return (
    <div className="project-view">
      <ProjectSidebar activeView={activeView} onViewChange={handleViewChange} />
      <div className="project-content">
        <Search onSearch={handleSearch} />
        <ExportImport
          projectId={projectId}
          nodes={nodes}
          edges={edges}
          onImport={handleImportProject}
        />
        {activeView === "canvas" && (
          <>
            <Canvas
              projectId={projectId}
              nodes={nodes}
              edges={edges}
              onNodeChange={handleNodeChange}
              onEdgeChange={handleEdgeChange}
            />
            <Generator onGenerateIdea={handleGenerateIdea} />
            <Connector nodes={nodes} onConnectNodes={handleConnectNodes} />
            <Organizer nodes={nodes} onOrganizeNodes={handleOrganizeNodes} />
          </>
        )}
        {activeView === "tasks" && <Tasks projectId={projectId} />}
        {activeView === "brainstorming" && (
          <BrainstormingSessions projectId={projectId} />
        )}
        {activeView === "insights" && <ProjectInsights projectId={projectId} />}
        {activeView === "milestones" && (
          <ProjectMilestones projectId={projectId} />
        )}
        {activeView === "comments" && <Comments projectId={projectId} />}
        {activeView === "ideas" && (
          <div>
            <h3>Ideas</h3>
            {/* Add your ideas component here */}
          </div>
        )}
        {activeView === "history" && <History projectId={projectId} />}
        {activeView === "search" && (
          <div>
            <h3>Search Results</h3>
            {searchResults.map((node) => (
              <div key={node.id} className="search-result">
                <h4>{node.data.label}</h4>
                <p>{node.data.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <IntegrationHub projectId={projectId} />
      <ExperimentLab projectId={projectId} />
    </div>
  );
};

export default ProjectView;
