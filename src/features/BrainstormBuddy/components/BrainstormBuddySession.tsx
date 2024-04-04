import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { io, Socket } from "socket.io-client";
import { FiThumbsUp, FiSend } from "react-icons/fi";
import {
  getSessionById,
  addIdeaToSession,
  voteOnIdea,
  deleteIdeaFromSession,
} from "../api/brainstormingApi";
import { saveIdeaToVault } from "../../IdeaVault/api/ideaVaultApi";

const BrainstormBuddySession: React.FC = () => {
  const router = useRouter();
  const { sessionId } = router.query;
  const [session, setSession] = useState<any>(null);
  const [newIdea, setNewIdea] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      if (sessionId) {
        const sessionData = await getSessionById(sessionId as string);
        setSession(sessionData);
      }
    };

    fetchSession();
  }, [sessionId]);

  useEffect(() => {
    const newSocket = io("http://localhost:3001");
    setSocket(newSocket);

    newSocket.on("newIdea", (idea: any) => {
      setSession((prevSession: any) => ({
        ...prevSession,
        ideas: [...prevSession.ideas, idea],
      }));
    });

    newSocket.on("ideaVoted", (updatedIdea: any) => {
      setSession((prevSession: any) => ({
        ...prevSession,
        ideas: prevSession.ideas.map((idea: any) =>
          idea.id === updatedIdea.id ? updatedIdea : idea
        ),
      }));
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleIdeaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newIdea.trim()) {
      const idea = await addIdeaToSession(sessionId as string, newIdea.trim());
      socket?.emit("newIdea", idea);
      setNewIdea("");
    }
  };

  const handleVote = async (ideaId: string) => {
    await voteOnIdea(sessionId as string, ideaId, "up");
    socket?.emit("ideaVoted", ideaId);
  };

  const handleDeleteIdea = async (ideaId: string) => {
    await deleteIdeaFromSession(sessionId as string, ideaId);
    setSession((prevSession: any) => ({
      ...prevSession,
      ideas: prevSession.ideas.filter((idea: any) => idea.id !== ideaId),
    }));
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
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="p-4 bg-white shadow">
        <h2 className="text-xl font-semibold mb-2">{session.title}</h2>
        <p className="text-gray-600">{session.description}</p>
      </div>
      <div className="flex-grow overflow-y-auto p-4">
        {session.ideas.map((idea: any) => (
          <div key={idea.id} className="mb-4 p-4 bg-white rounded shadow">
            <p>{idea.content}</p>
            <div className="flex justify-between items-center mt-2">
              <button
                onClick={() => handleVote(idea.id)}
                className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none"
              >
                <FiThumbsUp className="inline-block mr-1" />
                Upvote ({idea.votes})
              </button>
              <button
                onClick={() => handleDeleteIdea(idea.id)}
                className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleIdeaSubmit} className="p-4 bg-white shadow">
        <div className="flex">
          <input
            type="text"
            value={newIdea}
            onChange={(e) => setNewIdea(e.target.value)}
            placeholder="Enter a new idea..."
            className="flex-grow px-4 py-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-r hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <FiSend className="inline-block" />
          </button>
        </div>
      </form>
      <button
        onClick={handleSaveToVault}
        className="fixed bottom-4 right-4 px-4 py-2 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        Save to Idea Vault
      </button>
    </div>
  );
};

export default BrainstormBuddySession;
