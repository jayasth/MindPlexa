// src/components/Workspace/NewProjectButton.tsx
import React from "react";
import { useDispatch } from "react-redux";
import { createWorkspace } from "../../services/api/workspace/workspaceApi";
import { addWorkspace } from "../../features/workspace/workspaceSlice";

const NewProjectButton: React.FC = () => {
  const dispatch = useDispatch();

  const handleCreateWorkspace = async () => {
    const workspaceName = prompt("Enter the workspace name:");
    if (workspaceName) {
      try {
        const newWorkspace = await createWorkspace(workspaceName);
        dispatch(addWorkspace(newWorkspace));
      } catch (error) {
        console.error("Error creating workspace:", error);
      }
    }
  };

  return <button onClick={handleCreateWorkspace}>Create New Workspace</button>;
};

export default NewProjectButton;
