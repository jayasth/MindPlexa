import React, { useState } from "react";
import Layout from "../../components/layout";
import MindmapCanvas from "../../components/MindmapPlayground/MindmapCanvas";

const TextToMindmap: React.FC = () => {
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Send request to backend API to generate mindmap
      // Update mindmap state with the response
    } catch (error) {
      console.error("Error generating mindmap:", error);
      setError("An error occurred while generating the mind map.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col h-screen">
        <h2 className="text-2xl font-bold mb-4">Text to Mind Map</h2>
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="flex">
            <input
              type="text"
              value={inputText}
              onChange={handleInputChange}
              placeholder="Enter a keyword..."
              className="w-full p-1 rounded-lg focus:ring focus:ring-opacity-30"
            />
            <button
              type="submit"
              className="px-4 py-2 btn-primary"
              disabled={isLoading}
            >
              {isLoading ? "Generating..." : "Generate"}
            </button>
          </div>
          {error && <p className="error-message mt-2">{error}</p>}
        </form>
        <div className="flex-1 overflow-auto rounded-lg shadow p-4">
          <MindmapCanvas />
        </div>
        <footer className="pt-16">{/* Add footer content */}</footer>
      </div>
    </Layout>
  );
};

export default TextToMindmap;
