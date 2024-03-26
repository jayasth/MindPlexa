import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiSearch } from "react-icons/fi";

interface IdeaExpansionAssistantProps {
  selectedIdea: any;
}

const IdeaExpansionAssistant: React.FC<IdeaExpansionAssistantProps> = ({
  selectedIdea,
}) => {
  const [expansionSuggestions, setExpansionSuggestions] = useState<any[]>([]);

  useEffect(() => {
    const fetchExpansionSuggestions = async () => {
      try {
        const response = await axios.post("/api/expansion-suggestions", {
          idea: selectedIdea,
        });
        setExpansionSuggestions(response.data);
      } catch (error) {
        console.error("Error fetching expansion suggestions:", error);
      }
    };

    fetchExpansionSuggestions();
  }, [selectedIdea]);

  return (
    <div className="idea-expansion-assistant">
      <h3 className="text-xl font-semibold mb-4">Idea Expansion Assistant</h3>
      <div className="selected-idea bg-gray-100 p-4 rounded-md mb-4">
        <h4 className="text-lg font-medium mb-2">{selectedIdea.title}</h4>
        <p>{selectedIdea.description}</p>
      </div>
      <div className="expansion-suggestions">
        <h5 className="text-lg font-medium mb-2">Expansion Suggestions</h5>
        <ul className="space-y-2">
          {expansionSuggestions.map((suggestion, index) => (
            <li key={index} className="bg-white p-4 rounded-md shadow-md">
              <div className="flex items-center mb-2">
                <FiSearch className="mr-2 text-gray-500" />
                <span className="text-sm font-medium text-gray-500">
                  {suggestion.type}
                </span>
              </div>
              <div className="text-base">{suggestion.text}</div>
              <button className="mt-2 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                Add Note
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="expansion-history mt-4">
        {/* Render expansion history */}
      </div>
    </div>
  );
};

export default IdeaExpansionAssistant;
