import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { FiSend } from "react-icons/fi";

interface BrainstormBuddyCollaboratorProps {
  sessionId: string;
  userId: string;
}

const BrainstormBuddyCollaborator: React.FC<
  BrainstormBuddyCollaboratorProps
> = ({ sessionId, userId }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [socket, setSocket] = useState<SocketIOClient.Socket | null>(null);

  useEffect(() => {
    const newSocket = io("http://localhost:3000");
    setSocket(newSocket);

    newSocket.emit("join", { sessionId, userId });

    newSocket.on("message", (message: any) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [sessionId, userId]);

  const handleSendMessage = () => {
    if (inputText.trim() !== "") {
      const newMessage = {
        userId,
        text: inputText,
        timestamp: new Date().toISOString(),
      };

      socket?.emit("message", newMessage);
      setInputText("");
    }
  };

  return (
    <div className="brainstorm-buddy-collaborator">
      <div className="chat-panel bg-white p-4 rounded-md shadow-md">
        <div className="messages space-y-2 mb-4">
          {messages.map((message, index) => (
            <div key={index} className="message">
              <span className="sender font-medium">{message.userId}: </span>
              <span className="text">{message.text}</span>
              <span className="timestamp ml-2 text-xs text-gray-500">
                {message.timestamp}
              </span>
            </div>
          ))}
        </div>
        <div className="input-container flex">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            className="flex-grow px-3 py-2 rounded-l-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSendMessage}
            className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <FiSend />
          </button>
        </div>
      </div>
      <div className="collaboration-features mt-4">
        {/* Render other collaboration features */}
      </div>
    </div>
  );
};

export default BrainstormBuddyCollaborator;
