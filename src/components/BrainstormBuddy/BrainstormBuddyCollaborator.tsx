import React, { useState } from "react";
import { FiSend } from "react-icons/fi";

interface Message {
  userId: string;
  text: string;
  timestamp: string;
}

interface BrainstormBuddyCollaboratorProps {
  sessionId: string;
  userId: string;
}

const BrainstormBuddyCollaborator: React.FC<
  BrainstormBuddyCollaboratorProps
> = ({ sessionId, userId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");

  const handleSendMessage = () => {
    if (inputText.trim() !== "") {
      const newMessage: Message = {
        userId,
        text: inputText,
        timestamp: new Date().toISOString(),
      };

      setMessages((prevMessages) => [...prevMessages, newMessage]);
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
