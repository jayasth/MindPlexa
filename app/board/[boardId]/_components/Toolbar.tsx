import { useState } from 'react';

interface ToolbarProps {
  onAddElement: (
    type: string,
    content: any,
    position: { x: number; y: number }
  ) => void;
}

const Toolbar = ({ onAddElement }: ToolbarProps) => {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const handleToolClick = (tool: string) => {
    setSelectedTool(tool === selectedTool ? null : tool);
  };

  const handleAddElement = () => {
    if (selectedTool === 'text') {
      onAddElement('text', { text: 'New Text' }, { x: 100, y: 100 });
    }
    // Add more element types and their respective creation logic
  };

  return (
    <div className="toolbar">
      <button
        className={`toolbar-button ${selectedTool === 'text' ? 'active' : ''}`}
        onClick={() => handleToolClick('text')}
      >
        Text
      </button>
      {/* Add more toolbar buttons */}
      <button
        className="toolbar-button add-element"
        onClick={handleAddElement}
        disabled={!selectedTool}
      >
        Add Element
      </button>
    </div>
  );
};

export default Toolbar;
