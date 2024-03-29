// src/components/SearchBar.tsx
import React, { useState } from "react";
import { FiSearch } from "react-icons/fi";

const SearchBar: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = () => {
    // Implement search functionality here
    console.log("Searching for:", searchTerm);
  };

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search ideas, mind maps, sessions..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <FiSearch
        className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400 cursor-pointer"
        onClick={handleSearch}
      />
    </div>
  );
};

export default SearchBar;
