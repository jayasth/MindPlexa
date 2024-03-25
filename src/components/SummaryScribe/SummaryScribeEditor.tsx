// src/components/SummaryScribe/SummaryScribeEditor.tsx

import React, { useState } from "react";

const SummaryScribeEditor: React.FC = () => {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value);
  };

  const handleGenerateSummary = async () => {
    try {
      // TODO: Implement the API call to generate the summary
      const generatedSummary = "This is a placeholder summary.";
      setSummary(generatedSummary);
    } catch (error) {
      console.error("Error generating summary:", error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow mb-4">
        <textarea
          className="w-full h-full p-4 border border-gray-300 rounded"
          placeholder="Enter your text here..."
          value={text}
          onChange={handleTextChange}
        />
      </div>
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={handleGenerateSummary}
      >
        Generate Summary
      </button>
      {summary && (
        <div className="mt-4">
          <h3 className="text-lg font-bold mb-2">Summary:</h3>
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
};

export default SummaryScribeEditor;
