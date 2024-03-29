// src/components/IdeaMapper/StylePanel.tsx

import React from "react";
import { FiCircle, FiSquare, FiStar, FiType } from "react-icons/fi";

interface StylePanelProps {
  onNodeStyleChange: (style: any) => void;
  onEdgeStyleChange: (style: any) => void;
}

const StylePanel: React.FC<StylePanelProps> = ({
  onNodeStyleChange,
  onEdgeStyleChange,
}) => {
  const handleNodeStyleChange = (style: any) => {
    onNodeStyleChange(style);
  };

  const handleEdgeStyleChange = (style: any) => {
    onEdgeStyleChange(style);
  };

  return (
    <div className="flex flex-col space-y-2">
      <button
        onClick={() => handleNodeStyleChange({ backgroundColor: "#ff0000" })}
        title="Red Node"
      >
        <FiCircle color="#ff0000" />
      </button>
      <button
        onClick={() => handleNodeStyleChange({ backgroundColor: "#00ff00" })}
        title="Green Node"
      >
        <FiSquare color="#00ff00" />
      </button>
      <button
        onClick={() => handleNodeStyleChange({ backgroundColor: "#0000ff" })}
        title="Blue Node"
      >
        <FiStar color="#0000ff" />
      </button>
      <button
        onClick={() => handleEdgeStyleChange({ stroke: "#000000" })}
        title="Black Edge"
      >
        <FiType color="#000000" />
      </button>
    </div>
  );
};

export default StylePanel;
