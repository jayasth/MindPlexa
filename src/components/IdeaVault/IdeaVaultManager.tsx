// src/components/IdeaVault/IdeaVaultManager.tsx
import React, { useState, useEffect } from "react";
import { FiSearch, FiPlus, FiTrash2 } from "react-icons/fi";
import {
  getIdeasForUser,
  deleteIdea,
  createIdea,
} from "../../api/ideaVaultApi";

const IdeaVaultManager: React.FC = () => {
  const [ideas, setIdeas] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newIdeaTitle, setNewIdeaTitle] = useState("");
  const [newIdeaDescription, setNewIdeaDescription] = useState("");

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
        });
        setIdeas((prevIdeas) => [...prevIdeas, idea]);
        setNewIdeaTitle("");
        setNewIdeaDescription("");
      } catch (error) {
        console.error("Error creating idea:", error);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* ... */}
      <div className="fixed bottom-4 left-4 right-4 p-4 bg-white rounded-lg shadow">
        <input
          type="text"
          value={newIdeaTitle}
          onChange={(e) => setNewIdeaTitle(e.target.value)}
          placeholder="Idea title"
          className="w-full px-4 py-2 mb-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <textarea
          value={newIdeaDescription}
          onChange={(e) => setNewIdeaDescription(e.target.value)}
          placeholder="Idea description"
          className="w-full px-4 py-2 mb-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        ></textarea>
        <button
          onClick={handleCreateIdea}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Create Idea
        </button>
      </div>
    </div>
  );
};

export default IdeaVaultManager;
