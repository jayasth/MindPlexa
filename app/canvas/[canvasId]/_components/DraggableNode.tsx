import React from 'react';

const DraggableNode: React.FC = () => {
  const handleNodeDrag = () => {
    // Implement node dragging functionality
  };

  return (
    <div className="draggable-node" draggable onDrag={handleNodeDrag}>
      {/* Add your node content */}
      <p>Draggable Node</p>
    </div>
  );
};

export default DraggableNode;
