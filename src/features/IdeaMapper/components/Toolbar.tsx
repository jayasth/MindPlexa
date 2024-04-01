// src/features/IdeaMapper/components/Toolbar.tsx
import React, { useState } from "react";
import {
  FiPlus,
  FiTrash2,
  FiSave,
  FiDownload,
  FiShare2,
  FiHelpCircle,
  FiGitMerge,
  FiSquare,
  FiChevronDown,
  FiMap,
} from "react-icons/fi";
import { RiMindMap } from "react-icons/ri";

interface ToolbarProps {
  onAddNode: () => void;
  onDeleteNode: (nodeId: string) => void;
  onSelectNode: (nodeId: string) => void;
  onOpenAIModal: () => void;
  onMapperTypeChange: (type: string) => void;
  selectedNode: string | null;
}
const Toolbar: React.FC<ToolbarProps> = ({
  onAddNode,
  onDeleteNode,
  onOpenAIModal,
  onMapperTypeChange,
  selectedNode,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedMapperType, setSelectedMapperType] = useState("tree");

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleMapperTypeChange = (type: string) => {
    setSelectedMapperType(type);
    onMapperTypeChange(type);
    setIsDropdownOpen(false);
  };

  const getMapperIcon = () => {
    switch (selectedMapperType) {
      case "tree":
        return <RiMindMap size={20} />;
      case "flow":
        return <FiGitMerge size={20} />;
      case "canvas":
        return <FiSquare size={20} />;
      default:
        return <RiMindMap size={20} />;
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="relative">
        <button
          onClick={toggleDropdown}
          className="flex items-center text-indigo-500 hover:text-indigo-700 focus:outline-none"
          title="Mapper Options"
        >
          {getMapperIcon()}
          <FiChevronDown className="ml-1" size={16} />
        </button>
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
            <button
              onClick={() => handleMapperTypeChange("tree")}
              className={`flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
                selectedMapperType === "tree" ? "bg-gray-100" : ""
              }`}
            >
              <RiMindMap className="mr-2" size={16} />
              Tree of Thoughts
            </button>
            <button
              onClick={() => handleMapperTypeChange("flow")}
              className={`flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
                selectedMapperType === "flow" ? "bg-gray-100" : ""
              }`}
            >
              <FiGitMerge className="mr-2" size={16} />
              Flow Path
            </button>
            <button
              onClick={() => handleMapperTypeChange("canvas")}
              className={`flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
                selectedMapperType === "canvas" ? "bg-gray-100" : ""
              }`}
            >
              <FiSquare className="mr-2" size={16} />
              Decision Web
            </button>
          </div>
        )}
      </div>
      <button
        onClick={onAddNode}
        className="text-green-500 hover:text-green-700"
        title="Add Node"
      >
        <FiPlus size={20} />
      </button>
      <button
        onClick={() => selectedNode && onDeleteNode(selectedNode)}
        className="text-red-500 hover:text-red-700"
        title="Delete Node"
      >
        <FiTrash2 size={20} />
      </button>
      <button className="text-blue-500 hover:text-blue-700" title="Save">
        <FiSave size={20} />
      </button>
      <button className="text-purple-500 hover:text-purple-700" title="Export">
        <FiDownload size={20} />
      </button>
      <button
        className="text-orange-500 hover:text-orange-700"
        title="Export to JSON"
      >
        <FiShare2 size={20} />
      </button>
      <button
        onClick={onOpenAIModal}
        className="text-indigo-500 hover:text-indigo-700"
        title="AI Assistant"
      >
        <FiHelpCircle size={20} />
      </button>
    </div>
  );
};

export default Toolbar;
