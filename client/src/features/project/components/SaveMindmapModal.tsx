import React, { useState } from "react";
import { Node as ReactFlowNode, Edge as ReactFlowEdge } from "reactflow";
import { saveMindmap } from "../utils/storage";

interface SaveMindmapModalProps {
  nodes: ReactFlowNode[];
  edges: ReactFlowEdge[];
  onClose: () => void;
}

const SaveMindmapModal: React.FC<SaveMindmapModalProps> = ({
  nodes,
  edges,
  onClose,
}) => {
  const [title, setTitle] = useState("");

  const handleSave = async () => {
    await saveMindmap(title, nodes, edges);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Save Mindmap</h2>
        <input
          type="text"
          placeholder="Enter mindmap title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex justify-end mt-4">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="ml-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveMindmapModal;
