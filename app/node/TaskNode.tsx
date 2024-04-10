import React from 'react';

const TaskNode: React.FC = () => {
  const handleTagClick = () => {
    // Implement tag click functionality
  };

  const handleLinkClick = () => {
    // Implement link click functionality
  };

  return (
    <div className="task-node">
      <h3>Task Node</h3>
      <div className="task-tags">
        <span onClick={handleTagClick}>Tag 1</span>
        <span onClick={handleTagClick}>Tag 2</span>
      </div>
      <div className="task-links">
        <a href="#" onClick={handleLinkClick}>
          Link 1
        </a>
        <a href="#" onClick={handleLinkClick}>
          Link 2
        </a>
      </div>
    </div>
  );
};

export default TaskNode;
