// src/components/IdeaMapper/KeywordInput.tsx

import React, { useState } from "react";

interface KeywordInputProps {
  onKeywordChange: (keyword: string) => Promise<void>;
}

const KeywordInput: React.FC<KeywordInputProps> = ({ onKeywordChange }) => {
  const [inputValue, setInputValue] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    setErrorMessage("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const keyword = inputValue.trim();

    if (keyword === "") {
      setErrorMessage("Please enter a keyword or topic.");
      return;
    }

    try {
      await onKeywordChange(keyword);
      setInputValue("");
    } catch (error) {
      console.error("Error generating mind map:", error);
      setErrorMessage("Failed to generate mind map. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center mb-4">
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder="Enter a keyword or topic"
        className="border border-gray-300 rounded px-4 py-2 mr-2"
      />
      <button type="submit" className="btn-primary">
        Generate Mind Map
      </button>
      {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
    </form>
  );
};

export default KeywordInput;
