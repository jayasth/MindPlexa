// src/components/Workspace/WorkspaceOverview.tsx
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import ProjectCard from "./ProjectCard";
import CreateProjectModal from "./CreateProjectModal";
import Button from "../common/Button";

const WorkspaceOverview: React.FC = () => {
  const workspaces = useSelector(
    (state: RootState) => state.workspace.workspaces
  );
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] =
    useState(false);

  const openCreateProjectModal = () => {
    setIsCreateProjectModalOpen(true);
  };

  const closeCreateProjectModal = () => {
    setIsCreateProjectModalOpen(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {workspaces.map((workspace) => (
        <div key={workspace.id}>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-semibold">{workspace.name}</h2>
            <Button onClick={openCreateProjectModal}>Create New Project</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workspace.projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      ))}
      <CreateProjectModal
        isOpen={isCreateProjectModalOpen}
        onClose={closeCreateProjectModal}
      />
    </div>
  );
};

export default WorkspaceOverview;
