import React from 'react';

const CellOverlay = ({ x, y, message }) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      backgroundColor: '#f8d7da',
      color: '#721c24',
      padding: '4px',
      borderRadius: '4px',
      border: '1px solid #f5c6cb',
      zIndex: 1000,
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    }}
  >
    {message}
  </div>
);

export default CellOverlay;
