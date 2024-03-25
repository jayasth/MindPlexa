// src/components/IdeaMapper/KeywordInput.tsx

import React, { useState } from "react";

interface KeywordInputProps {
  onGenerateRelatedWords: (keyword: string) => void;
}

const KeywordInput: React.FC<KeywordInputProps> = ({
  onGenerateRelatedWords,
}) => {
  const [keyword, setKeyword] = useState("");

  const handleKeywordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onGenerateRelatedWords(keyword);
    setKeyword("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center mb-4">
      <input
        type="text"
        value={keyword}
        onChange={handleKeywordChange}
        placeholder="Enter a keyword"
        className="border border-gray-300 rounded px-4 py-2 mr-2"
      />
      <button type="submit" className="btn-primary">
        Generate Related Words
      </button>
    </form>
  );
};

export default KeywordInput;
