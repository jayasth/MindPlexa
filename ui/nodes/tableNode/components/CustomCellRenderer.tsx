import React from 'react';

const CustomCellRenderer = (props) => {
  const handleCellClick = () => {
    navigator.clipboard.writeText(props.value).then(() => {
      console.log('Copied to clipboard:', props.value);
    });
    props.api.startEditingCell({
      rowIndex: props.rowIndex,
      colKey: props.column.getId()
    });
  };

  return <div onClick={handleCellClick}>{props.value}</div>;
};

export default CustomCellRenderer;
