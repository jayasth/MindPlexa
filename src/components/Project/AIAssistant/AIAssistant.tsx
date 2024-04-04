// src/components/Project/AIAssistant/AIAssistant.tsx
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { generateIdeas } from "../../../features/AIAssistant/aiAssistantSlice";
import Input from "../../Common/Input";
import Button from "../../Common/Button";

const AIAssistant: React.FC = () => {
  const dispatch = useDispatch();
  const [prompt, setPrompt] = useState("");

  const handleGenerateIdeas = () => {
    if (prompt.trim() !== "") {
      dispatch(generateIdeas(prompt));
      setPrompt("");
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">AI Assistant</h3>
      <div className="flex items-center">
        <Input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter a prompt..."
          className="flex-grow mr-4"
        />
        <Button onClick={handleGenerateIdeas}>Generate Ideas</Button>
      </div>
      {/* Add generated ideas display */}
    </div>
  );
};

export default AIAssistant;
