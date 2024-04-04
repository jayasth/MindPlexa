import React, { useState } from "react";
import { useNodesState } from "reactflow";

const KeywordInput: React.FC = () => {
  const [keyword, setKeyword] = useState("");
  const [nodes, setNodes] = useNodesState([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      try {
        const response = await fetch("/api/generate-nodes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ keyword }),
        });

        if (response.ok) {
          const generatedNodes = await response.json();
          setNodes((prevNodes) => [...prevNodes, ...generatedNodes]);
          setKeyword("");
        } else {
          console.error("Error generating nodes:", response.statusText);
        }
      } catch (error) {
        console.error("Error generating nodes:", error);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="Enter a keyword"
        className="border border-gray-300 rounded px-4 py-2 w-full"
      />
      <button
        type="submit"
        className="bg-blue-500 text-white rounded px-4 py-2 mt-2"
      >
        Generate Mindmap
      </button>
    </form>
  );
};

export default KeywordInput;
