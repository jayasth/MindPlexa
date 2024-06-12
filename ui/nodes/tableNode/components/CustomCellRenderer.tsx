import React from 'react';

const CustomCellRenderer = (props) => {
  const handleCellMouseUp = () => {
    // Your custom logic for handling cell mouse up event
    console.log('Cell clicked:', props.value);
  };

  return <div onMouseUp={handleCellMouseUp}>{props.value}</div>;
};

export default CustomCellRenderer;
