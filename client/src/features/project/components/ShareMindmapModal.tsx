import React, { useState } from "react";
import { shareMindmap } from "../utils/storage";

interface ShareMindmapModalProps {
  mindmapId: number;
  onClose: () => void;
}

const ShareMindmapModal: React.FC<ShareMindmapModalProps> = ({
  mindmapId,
  onClose,
}) => {
  const [email, setEmail] = useState("");
  const [accessLevel, setAccessLevel] = useState("read");

  const handleShare = async () => {
    // TODO: Implement user lookup by email
    const userId = "user_id_from_email_lookup";
    await shareMindmap(mindmapId, userId, accessLevel);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Share Mindmap</h2>
        <input
          type="email"
          placeholder="Enter email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 rounded px-4 py-2 mb-4 w-full"
        />
        <select
          value={accessLevel}
          onChange={(e) => setAccessLevel(e.target.value)}
          className="border border-gray-300 rounded px-4 py-2 mb-4 w-full"
        >
          <option value="read">Read Only</option>
          <option value="write">Read and Write</option>
        </select>
        <div className="flex justify-end">
          <button
            onClick={handleShare}
            className="bg-blue-500 text-white rounded px-4 py-2 mr-2"
          >
            Share
          </button>
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-700 rounded px-4 py-2"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareMindmapModal;
