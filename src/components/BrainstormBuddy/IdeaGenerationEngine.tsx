import React, { useState } from "react";
import axios from "axios";
import { FiRefreshCw } from "react-icons/fi";

interface IdeaGenerationEngineProps {
  sessionData: any;
  onIdeasGenerated: (ideas: string[]) => void;
}

const IdeaGenerationEngine: React.FC<IdeaGenerationEngineProps> = ({
  sessionData,
  onIdeasGenerated,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateIdeas = async () => {
    setIsGenerating(true);

    try {
      const { title, description, keywords } = sessionData;

      const preprocessedTitle = preprocessText(title);
      const preprocessedDescription = preprocessText(description);
      const preprocessedKeywords = keywords.map((keyword: string) =>
        preprocessText(keyword)
      );

      const response = await axios.post("/api/generate-ideas", {
        title: preprocessedTitle,
        description: preprocessedDescription,
        keywords: preprocessedKeywords,
      });

      const generatedIdeas = response.data.ideas;
      onIdeasGenerated(generatedIdeas);
    } catch (error) {
      console.error("Error generating ideas:", error);
      // Handle error state
    }

    setIsGenerating(false);
  };

  const preprocessText = (text: string) => {
    // Perform text preprocessing (lowercase, tokenization, remove stopwords, etc.)
    // You can use libraries like natural.js for more advanced preprocessing
    return text.toLowerCase().trim();
  };

  return (
    <div className="idea-generation-engine">
      <button
        onClick={generateIdeas}
        disabled={isGenerating}
        className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? (
          <FiRefreshCw className="animate-spin mr-2" />
        ) : (
          <FiRefreshCw className="mr-2" />
        )}
        {isGenerating ? "Generating Ideas..." : "Generate Ideas"}
      </button>
    </div>
  );
};

export default IdeaGenerationEngine;
