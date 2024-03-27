// src/components/BrainstormBuddy/BrainstormBuddySession.tsx

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { FiMessageCircle, FiThumbsUp, FiThumbsDown } from "react-icons/fi";
import {
  getSessionById,
  addIdeaToSession,
  voteOnIdea,
} from "../../api/brainstormingApi";
import { saveIdeaToVault } from "../../api/ideaVaultApi";
import { initSocket, getSocket } from "../../utils/socket";

const BrainstormBuddySession: React.FC = () => {
  const router = useRouter();
  const { sessionId } = router.query;
  const [session, setSession] = useState<any>(null);
  const [newIdea, setNewIdea] = useState("");

  useEffect(() => {
    initSocket();

    const socket = getSocket();

    socket?.on("newIdea", (idea: any) => {
      setSession((prevSession: any) => ({
        ...prevSession,
        ideas: [...prevSession.ideas, idea],
      }));
    });

    socket?.on("ideaVoted", (updatedIdea: any) => {
      setSession((prevSession: any) => ({
        ...prevSession,
        ideas: prevSession.ideas.map((idea: any) =>
          idea.id === updatedIdea.id ? updatedIdea : idea
        ),
      }));
    });

    return () => {
      socket?.disconnect();
    };
  }, []);

  useEffect(() => {
    const fetchSession = async () => {
      if (sessionId) {
        const sessionData = await getSessionById(sessionId as string);
        setSession(sessionData);
      }
    };

    fetchSession();
  }, [sessionId]);

  const handleIdeaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newIdea.trim()) {
      const idea = await addIdeaToSession(sessionId as string, newIdea.trim());
      getSocket()?.emit("newIdea", idea);
      setNewIdea("");
    }
  };

  const handleVote = async (ideaId: string, vote: "up" | "down") => {
    const updatedIdea = await voteOnIdea(sessionId as string, ideaId, vote);
    getSocket()?.emit("ideaVoted", updatedIdea);
  };

  const handleSaveToVault = async () => {
    try {
      await saveIdeaToVault(session);
      router.push("/agents/IdeaVault");
    } catch (error) {
      console.error("Error saving idea to vault:", error);
    }
  };

  if (!session) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">{session.title}</h2>
      <p className="mb-4">{session.description}</p>
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Ideas</h3>
        <ul className="space-y-4">
          {session.ideas.map((idea: any) => (
            <li key={idea.id} className="flex items-center">
              <div className="flex-grow">{idea.content}</div>
              <button
                onClick={() => handleVote(idea.id, "up")}
                className="px-2 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 mr-2"
              >
                <FiThumbsUp />
              </button>
              <button
                onClick={() => handleVote(idea.id, "down")}
                className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <FiThumbsDown />
              </button>
            </li>
          ))}
        </ul>
      </div>
      <form onSubmit={handleIdeaSubmit} className="flex">
        <input
          type="text"
          value={newIdea}
          onChange={(e) => setNewIdea(e.target.value)}
          placeholder="Enter a new idea..."
          className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <FiMessageCircle className="mr-2" />
          Submit
        </button>
      </form>
      <button
        onClick={handleSaveToVault}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Save to Idea Vault
      </button>
    </div>
  );
};

export default BrainstormBuddySession;
