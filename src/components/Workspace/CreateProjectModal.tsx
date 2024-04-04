// src/components/Workspace/CreateProjectModal.tsx
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import createProject from "../../features/Workspace/workspaceSlice";
import Modal from "../Common/Modal";
import Input from "../Common/Input";
import Button from "../Common/Button";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
}) => {
  const dispatch = useDispatch();
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  const handleCreateProject = () => {
    if (projectName.trim() !== "") {
      dispatch(
        createProject({ name: projectName, description: projectDescription })
      );
      setProjectName("");
      setProjectDescription("");
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
      <Input
        label="Project Name"
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
        required
      />
      <Input
        label="Project Description"
        value={projectDescription}
        onChange={(e) => setProjectDescription(e.target.value)}
        multiline
      />
      <div className="flex justify-end mt-4">
        <Button onClick={handleCreateProject}>Create Project</Button>
      </div>
    </Modal>
  );
};

export default CreateProjectModal;
