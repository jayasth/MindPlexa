import React from 'react';

const CustomCellRenderer = (props) => {
  const handleCellClick = () => {
    props.api.startEditingCell({
      rowIndex: props.rowIndex,
      colKey: props.column.getId()
    });
  };

  return <div onClick={handleCellClick}>{props.value}</div>;
};

export default CustomCellRenderer;
