// src/components/IdeaVault/IdeaVaultManager.tsx

import React, { useState, useEffect } from "react";
import {
  getIdeasForUser,
  deleteIdea,
  createIdea,
  updateIdea,
} from "../../../api/ideaVaultApi";
import { FiSearch, FiPlus, FiTrash2, FiEdit2 } from "react-icons/fi";

const IdeaVaultManager: React.FC = () => {
  const [ideas, setIdeas] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [newIdeaTitle, setNewIdeaTitle] = useState("");
  const [newIdeaDescription, setNewIdeaDescription] = useState("");
  const [newIdeaTags, setNewIdeaTags] = useState("");

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

  const filteredIdeas = ideas.filter((idea) =>
    idea.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteIdea = async (ideaId: string) => {
    try {
      await deleteIdea(ideaId);
      setIdeas((prevIdeas) => prevIdeas.filter((idea) => idea.id !== ideaId));
    } catch (error) {
      console.error("Error deleting idea:", error);
    }
  };

  const handleCreateIdea = async () => {
    if (newIdeaTitle.trim() && newIdeaDescription.trim()) {
      try {
        const idea = await createIdea({
          title: newIdeaTitle,
          description: newIdeaDescription,
          tags: newIdeaTags.split(",").map((tag) => tag.trim()),
        });
        setIdeas((prevIdeas) => [...prevIdeas, idea]);
        setNewIdeaTitle("");
        setNewIdeaDescription("");
        setNewIdeaTags("");
      } catch (error) {
        console.error("Error creating idea:", error);
      }
    }
  };

  const handleSelectIdea = (idea: any) => {
    setSelectedIdea(idea);
  };

  const handleUpdateIdea = async () => {
    if (selectedIdea) {
      try {
        const updatedIdea = await updateIdea(selectedIdea.id, {
          title: selectedIdea.title,
          description: selectedIdea.description,
          tags: selectedIdea.tags,
        });
        setIdeas((prevIdeas) =>
          prevIdeas.map((idea) =>
            idea.id === updatedIdea.id ? updatedIdea : idea
          )
        );
        setSelectedIdea(null);
      } catch (error) {
        console.error("Error updating idea:", error);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center justify-between p-4 bg-white shadow">
        <h2 className="text-xl font-semibold">Idea Vault Manager</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search ideas..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <FiSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>
      <div className="flex-grow overflow-y-auto p-4">
        {filteredIdeas.map((idea) => (
          <div
            key={idea.id}
            className={`p-4 mb-4 bg-white rounded-md shadow cursor-pointer ${
              selectedIdea?.id === idea.id ? "ring-2 ring-blue-500" : ""
            }`}
            onClick={() => handleSelectIdea(idea)}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">{idea.title}</h3>
              <div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteIdea(idea.id);
                  }}
                  className="text-red-500 hover:text-red-600 focus:outline-none"
                >
                  <FiTrash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            <p className="text-gray-600">{idea.description}</p>
            {idea.tags && (
              <div className="mt-2">
                {idea.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="inline-block px-2 py-1 mr-2 text-sm bg-gray-200 text-gray-700 rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      {selectedIdea && (
        <div className="p-4 bg-white shadow">
          <h3 className="text-lg font-semibold mb-2">{selectedIdea.title}</h3>
          <p className="text-gray-600 mb-4">{selectedIdea.description}</p>
          <input
            type="text"
            placeholder="Update title..."
            value={selectedIdea.title}
            onChange={(e) =>
              setSelectedIdea({
                ...selectedIdea,
                title: e.target.value,
              })
            }
            className="w-full px-4 py-2 mb-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            placeholder="Update description..."
            value={selectedIdea.description}
            onChange={(e) =>
              setSelectedIdea({
                ...selectedIdea,
                description: e.target.value,
              })
            }
            className="w-full px-4 py-2 mb-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
          <input
            type="text"
            placeholder="Update tags (comma-separated)..."
            value={selectedIdea.tags.join(", ")}
            onChange={(e) =>
              setSelectedIdea({
                ...selectedIdea,
                tags: e.target.value.split(",").map((tag) => tag.trim()),
              })
            }
            className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleUpdateIdea}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <FiEdit2 className="inline-block mr-2" />
            Update Idea
          </button>
        </div>
      )}
      <div className="p-4 bg-white shadow">
        <h3 className="text-lg font-semibold mb-2">Create New Idea</h3>
        <input
          type="text"
          placeholder="Enter title..."
          value={newIdeaTitle}
          onChange={(e) => setNewIdeaTitle(e.target.value)}
          className="w-full px-4 py-2 mb-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <textarea
          placeholder="Enter description..."
          value={newIdeaDescription}
          onChange={(e) => setNewIdeaDescription(e.target.value)}
          className="w-full px-4 py-2 mb-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        ></textarea>
        <input
          type="text"
          placeholder="Enter tags (comma-separated)..."
          value={newIdeaTags}
          onChange={(e) => setNewIdeaTags(e.target.value)}
          className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleCreateIdea}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <FiPlus className="inline-block mr-2" />
          Create Idea
        </button>
      </div>
    </div>
  );
};

export default IdeaVaultManager;
