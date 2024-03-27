// src/components/IdeaVault/IdeaVaultList.tsx

import React, { useState, useEffect } from "react";
import { getIdeasForUser } from "../../api/ideaVaultApi";

const IdeaVaultList: React.FC = () => {
  const [ideas, setIdeas] = useState<any[]>([]);

  useEffect(() => {
    const fetchIdeas = async () => {
      const ideasData = await getIdeasForUser();
      setIdeas(ideasData);
    };

    fetchIdeas();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Idea Vault</h2>
      {ideas.length === 0 ? (
        <p>No ideas found.</p>
      ) : (
        <ul className="space-y-4">
          {ideas.map((idea) => (
            <li key={idea.id} className="bg-white p-4 rounded-md shadow">
              <h3 className="text-xl font-semibold mb-2">{idea.title}</h3>
              <p>{idea.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default IdeaVaultList;
