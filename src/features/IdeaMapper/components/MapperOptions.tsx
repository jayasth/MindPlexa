// src/features/IdeaMapper/components/MapperOptions.tsx
import React from "react";
import { FiMap, FiGitMerge, FiSquare } from "react-icons/fi";

interface MapperOptionsProps {
  selectedType: string;
  onTypeChange: (type: string) => void;
}

const MapperOptions: React.FC<MapperOptionsProps> = ({
  selectedType,
  onTypeChange,
}) => {
  const mapperTypes = [
    { type: "tree", label: "Tree", icon: FiMap },
    { type: "flow", label: "Flow", icon: FiGitMerge },
    { type: "canvas", label: "Canvas", icon: FiSquare },
  ];

  return (
    <div className="space-y-2">
      {mapperTypes.map(({ type, label, icon: Icon }) => (
        <button
          key={type}
          onClick={() => onTypeChange(type)}
          className={`flex items-center space-x-2 w-full p-2 rounded ${
            selectedType === type
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-700"
          }`}
        >
          <Icon size={20} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
};

export default MapperOptions;
