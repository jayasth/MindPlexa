import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiBookmark, FiSearch } from "react-icons/fi";

const InspirationLibrary: React.FC = () => {
  const [inspirations, setInspirations] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchInspirations();
  }, [selectedCategory, searchQuery]);

  const fetchInspirations = async () => {
    try {
      const response = await axios.get("/api/inspirations", {
        params: {
          category: selectedCategory,
          search: searchQuery,
        },
      });
      setInspirations(response.data);
    } catch (error) {
      console.error("Error fetching inspirations:", error);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleBookmark = async (inspirationId: string) => {
    try {
      await axios.post(`/api/inspirations/${inspirationId}/bookmark`);
      fetchInspirations();
    } catch (error) {
      console.error("Error bookmarking inspiration:", error);
    }
  };

  return (
    <div className="inspiration-library">
      <h2 className="text-2xl font-bold mb-4">Inspiration Library</h2>
      <div className="filters mb-4">
        <select
          value={selectedCategory}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Categories</option>
          <option value="innovation">Innovation</option>
          <option value="creativity">Creativity</option>
          <option value="design">Design</option>
          {/* Add more category options */}
        </select>
        <div className="relative">
          <input
            type="text"
            placeholder="Search inspirations..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="px-4 py-2 border border-gray-300 rounded-md pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <FiSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>
      <div className="inspiration-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {inspirations.map((inspiration) => (
          <div
            key={inspiration.id}
            className="inspiration-item bg-white rounded-md shadow-md p-4"
          >
            <img
              src={inspiration.thumbnail}
              alt={inspiration.title}
              className="w-full h-40 object-cover rounded-md mb-2"
            />
            <h3 className="text-lg font-semibold mb-2">{inspiration.title}</h3>
            <p className="text-gray-600 mb-4">{inspiration.description}</p>
            <button
              onClick={() => handleBookmark(inspiration.id)}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <FiBookmark className="mr-2" />
              Bookmark
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InspirationLibrary;
