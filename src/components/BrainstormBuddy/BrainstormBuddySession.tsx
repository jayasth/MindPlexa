// src/components/BrainstormBuddy/BrainstormBuddySession.tsx
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { FiThumbsUp, FiSend } from "react-icons/fi";
import {
  getSessionById,
  addIdeaToSession,
  voteOnIdea,
  deleteIdeaFromSession,
} from "../../api/brainstormingApi";
import { saveIdeaToVault } from "../../api/ideaVaultApi";
import { io, Socket } from "socket.io-client";

const BrainstormBuddySession: React.FC = () => {
  const router = useRouter();
  const { sessionId } = router.query;
  const [session, setSession] = useState<any>(null);
  const [newIdea, setNewIdea] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io("/brainstorming");
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("idea", (idea: any) => {
        setSession((prevSession: any) => ({
          ...prevSession,
          ideas: [...prevSession.ideas, idea],
        }));
      });

      socket.on("vote", (ideaId: string) => {
        setSession((prevSession: any) => ({
          ...prevSession,
          ideas: prevSession.ideas.map((idea: any) =>
            idea.id === ideaId ? { ...idea, votes: idea.votes + 1 } : idea
          ),
        }));
      });

      socket.on("delete", (ideaId: string) => {
        setSession((prevSession: any) => ({
          ...prevSession,
          ideas: prevSession.ideas.filter((idea: any) => idea.id !== ideaId),
        }));
      });
    }
  }, [socket]);

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
      socket?.emit("idea", idea);
      setNewIdea("");
    }
  };

  const handleVote = async (ideaId: string) => {
    await voteOnIdea(sessionId as string, ideaId, "up");
    socket?.emit("vote", ideaId);
  };

  const handleDeleteIdea = async (ideaId: string) => {
    await deleteIdeaFromSession(sessionId as string, ideaId);
    socket?.emit("delete", ideaId);
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
            <button
              onClick={() => handleVote(idea.id)}
              className="mt-2 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none"
            >
              <FiThumbsUp className="inline-block mr-1" />
              Upvote ({idea.votes})
            </button>
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
