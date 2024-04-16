// client\src\components\ai\generator\Generator.tsx
import React, { useState } from "react";
import axios from "axios";
import { FaRobot } from "react-icons/fa";

interface GeneratorProps {
  onGenerateIdea: (idea: string) => void;
}

const Generator: React.FC<GeneratorProps> = ({ onGenerateIdea }) => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("/api/ai/generate", { prompt });
      const generatedIdea = response.data.idea;
      onGenerateIdea(generatedIdea);
      setPrompt("");
    } catch (error) {
      console.error("Error generating idea:", error);
    }

    setLoading(false);
  };

  return (
    <div className="generator">
      <h3>
        <FaRobot className="generator-icon" /> AI Idea Generator
      </h3>
      <form onSubmit={handleSubmit}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter a prompt for the AI..."
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Generating..." : "Generate Idea"}
        </button>
      </form>
    </div>
  );
};

export default Generator;
