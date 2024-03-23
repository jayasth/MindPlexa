// src\pages\agents\TextToMindmap.tsx

import React, { useState } from "react";
import Layout from "../../components/layout";

const TextToMindmap: React.FC = () => {
  const [inputText, setInputText] = useState("");
  const [mindMap, setMindMap] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const agentId = 2; // The agent ID for TextToMindmap

    try {
      const response = await fetch("/api/generate-mindmap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agentId, // Send the agent ID along with the request
          inputText, // The text input from the user
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Ensure that the key matches what the backend sends
        setMindMap(data.mindMap);
      } else {
        setError("Failed to generate mind map. Please try again.");
      }
    } catch (error) {
      console.error("Error generating mindmap:", error);
      setError("An error occurred while generating the mind map.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">Text to Mind Map</h2>
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex items-center">
            <input
              type="text"
              value={inputText}
              onChange={handleInputChange}
              placeholder="Enter a keyword..."
              className="w-full px-3 py-2 text-gray-700 border rounded-l-lg focus:outline-none focus:border-primary"
            />
            <button
              type="submit"
              className="px-4 py-2 font-bold text-white bg-primary rounded-r-lg hover:bg-indigo-600 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Generating..." : "Generate"}
            </button>
          </div>
        </form>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {mindMap && (
          <div className="w-full h-96 overflow-auto border rounded-lg shadow-md">
            <div className="p-4">
              <h3 className="text-xl font-bold mb-2">Generated Mind Map:</h3>
              {/* Render the mindMap using a canvas library */}
              <div>{mindMap}</div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TextToMindmap;
