import React, { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import Canvas from "./Canvas";
import ProjectSidebar from "./ProjectSidebar";
import Generator from "../ai/generator/Generator";
import Connector from "../ai/connector/Connector";
import Expander from "../ai/expander/Expander";
import Organizer from "../ai/organizer/Organizer";
import IntegrationHub from "./integrationHub/IntegrationHub";
import ExperimentLab from "./experimentLab/ExperimentLab";

interface ProjectViewProps {
  projectId: string;
}

const ProjectView: React.FC<ProjectViewProps> = ({ projectId }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io("http://localhost:3001");
    setSocket(newSocket);

    newSocket.emit("joinProject", projectId);

    newSocket.on("nodeUpdated", (data) => {
      // Update the node in the local state based on the received data
      // You can use the data.nodeId to identify the node and update its properties
    });

    newSocket.on("edgeUpdated", (data) => {
      // Update the edge in the local state based on the received data
      // You can use the data.edgeId to identify the edge and update its properties
    });

    return () => {
      newSocket.emit("leaveProject", projectId);
      newSocket.disconnect();
    };
  }, [projectId]);

  const handleNodeUpdate = (nodeId, properties) => {
    // Update the node in the local state
    // ...

    // Emit the nodeUpdate event to the server
    socket?.emit("nodeUpdate", { projectId, nodeId, properties });
  };

  const handleEdgeUpdate = (edgeId, properties) => {
    // Update the edge in the local state
    // ...

    // Emit the edgeUpdate event to the server
    socket?.emit("edgeUpdate", { projectId, edgeId, properties });
  };

  const handleGenerateIdea = (idea: string) => {
    // Handle the generated idea, e.g., create a new node with the idea
    console.log("Generated idea:", idea);
  };
  const handleConnectNodes = (sourceNodeId: string, targetNodeId: string) => {
    // Handle the node connection suggestion
    console.log(`Connect nodes: ${sourceNodeId} -> ${targetNodeId}`);
    // Add logic to create an edge between the nodes
  };
  const handleExpandNode = (nodeId: string, expandedContent: string) => {
    // Handle the expanded node content
    console.log(`Expanded content for node ${nodeId}:`, expandedContent);
    // Add logic to update the node content in the project state
  };

  const handleOrganizeNodes = (organizedNodes: Node[]) => {
    // Handle the organized nodes
    console.log("Organized nodes:", organizedNodes);
    // Add logic to update the nodes in the project state
  };

  const [activeView, setActiveView] = useState("canvas");

  const handleViewChange = (view: string) => {
    setActiveView(view);
  };

  return (
    <div className="project-view">
      <ProjectSidebar activeView={activeView} onViewChange={handleViewChange} />
      <div className="project-content">
        {activeView === "canvas" && (
          <>
            <Canvas projectId={projectId} />
            <Generator onGenerateIdea={handleGenerateIdea} />
            <Connector nodes={nodes} onConnectNodes={handleConnectNodes} />
            <Organizer nodes={nodes} onOrganizeNodes={handleOrganizeNodes} />
          </>
        )}
        {activeView === "ideas" && (
          <div>
            <h3>Ideas</h3>
            {/* Add your ideas component here */}
          </div>
        )}
        {activeView === "comments" && (
          <div>
            <h3>Comments</h3>
            {/* Add your comments component here */}
          </div>
        )}
        {activeView === "history" && (
          <div>
            <h3>History</h3>
            {/* Add your history component here */}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectView;
