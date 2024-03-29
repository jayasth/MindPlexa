// src/components/IdeaVault/IdeaVaultList.tsx

import React, { useState, useEffect } from "react";
import { getIdeasForUser } from "../../../api/ideaVaultApi";
import { FiSearch, FiTag } from "react-icons/fi";

const IdeaVaultList: React.FC = () => {
  const [ideas, setIdeas] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("");

  useEffect(() => {
    const fetchIdeas = async () => {
      const ideasData = await getIdeasForUser();
      setIdeas(ideasData);
    };

    fetchIdeas();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleTagSelect = (tag: string) => {
    setSelectedTag(tag);
  };

  const filteredIdeas = ideas.filter((idea) => {
    const matchesSearchTerm = idea.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesSelectedTag =
      selectedTag === "" || idea.tags?.includes(selectedTag);
    return matchesSearchTerm && matchesSelectedTag;
  });

  const uniqueTags = Array.from(
    new Set(ideas.flatMap((idea) => idea.tags || []))
  );

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Idea Vault</h2>
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search ideas..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <FiSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>
      <div className="mb-4">
        <button
          onClick={() => handleTagSelect("")}
          className={`px-2 py-1 mr-2 rounded ${
            selectedTag === ""
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          All
        </button>
        {uniqueTags.map((tag) => (
          <button
            key={tag}
            onClick={() => handleTagSelect(tag)}
            className={`px-2 py-1 mr-2 rounded ${
              selectedTag === tag
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            <FiTag className="inline-block mr-1" />
            {tag}
          </button>
        ))}
      </div>
      {filteredIdeas.length === 0 ? (
        <p>No ideas found.</p>
      ) : (
        <ul className="space-y-4">
          {filteredIdeas.map((idea) => (
            <li key={idea.id} className="bg-white p-4 rounded-md shadow">
              <h3 className="text-xl font-semibold mb-2">{idea.title}</h3>
              <p className="text-gray-600 mb-4">{idea.description}</p>
              {idea.tags && (
                <div className="flex flex-wrap">
                  {idea.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-2 py-1 mr-2 mb-2 bg-gray-200 text-gray-700 rounded-md text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default IdeaVaultList;
