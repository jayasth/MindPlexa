// client/src/components/workspace/WorkspaceModal.tsx
import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";

interface WorkspaceModalProps {
  onSubmit: (name: string, description: string) => void;
  onClose: () => void;
}

const WorkspaceModal: React.FC<WorkspaceModalProps> = ({
  onSubmit,
  onClose,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(name, description);
    setName("");
    setDescription("");
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Create Workspace</h3>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <button type="submit">Create</button>
        </form>
      </div>
    </div>
  );
};

export default WorkspaceModal;
