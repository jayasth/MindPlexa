import React from 'react';

const MediaNode: React.FC = () => {
  const handleMediaUpload = () => {
    // Implement media upload functionality
  };

  return (
    <div className="media-node">
      <h3>Media Node</h3>
      <button onClick={handleMediaUpload}>Upload Media</button>
      {/* Add media preview */}
    </div>
  );
};

export default MediaNode;
