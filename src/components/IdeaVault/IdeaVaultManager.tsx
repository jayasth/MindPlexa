// src/components/IdeaVault/IdeaVaultManager.tsx
import React, { useState, useEffect } from "react";
import { FiSearch, FiPlus, FiTrash2 } from "react-icons/fi";
import { getIdeasForUser, deleteIdea } from "../../api/ideaVaultApi";

const IdeaVaultManager: React.FC = () => {
  const [ideas, setIdeas] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

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

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="p-4 bg-white shadow">
        <h2 className="text-xl font-semibold mb-2">Idea Vault</h2>
        <div className="flex items-center">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search ideas..."
            className="flex-grow px-4 py-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-r hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <FiSearch className="inline-block" />
          </button>
        </div>
      </div>
      <div className="flex-grow overflow-y-auto p-4">
        {filteredIdeas.map((idea) => (
          <div key={idea.id} className="mb-4 p-4 bg-white rounded shadow">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">{idea.title}</h3>
              <button
                onClick={() => handleDeleteIdea(idea.id)}
                className="text-red-500 hover:text-red-600 focus:outline-none"
              >
                <FiTrash2 className="inline-block" />
              </button>
            </div>
            <p className="text-gray-600">{idea.description}</p>
          </div>
        ))}
      </div>
      <button className="fixed bottom-4 right-4 p-4 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
        <FiPlus className="inline-block" size={24} />
      </button>
    </div>
  );
};

export default IdeaVaultManager;
