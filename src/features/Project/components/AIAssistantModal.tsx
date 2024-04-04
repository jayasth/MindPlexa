import React, { useState } from "react";
import axios from "axios";

interface AIAssistantModalProps {
  nodeId: string;
  nodeLabel: string;
  onClose: () => void;
  onSuggestionAccepted: (suggestion: string) => void;
}

const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  nodeId,
  nodeLabel,
  onClose,
  onSuggestionAccepted,
}) => {
  const [suggestion, setSuggestion] = useState("");

  const handleSuggestionRequest = async () => {
    try {
      const response = await axios.post("/api/generate-suggestion", {
        nodeId,
        nodeLabel,
      });
      setSuggestion(response.data.suggestion);
    } catch (error) {
      console.error("Error generating suggestion:", error);
    }
  };

  const handleAcceptSuggestion = () => {
    onSuggestionAccepted(suggestion);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">AI Assistant</h2>
        {suggestion ? (
          <>
            <p className="mb-4">{suggestion}</p>
            <div className="flex justify-end">
              <button
                onClick={handleAcceptSuggestion}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Accept Suggestion
              </button>
              <button
                onClick={onClose}
                className="ml-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Close
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="mb-4">
              Click the button below to request a suggestion from the AI
              assistant.
            </p>
            <div className="flex justify-end">
              <button
                onClick={handleSuggestionRequest}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Request Suggestion
              </button>
              <button
                onClick={onClose}
                className="ml-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AIAssistantModal;
