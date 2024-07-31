import React from 'react';
import { Tooltip } from '@/ui/Tooltip/Tooltip';
import styles from '@/ui/nodes/tableNode/styles/CustomCellRenderer.module.css';

const CustomCellRenderer = (props) => {
  const handleCellClick = () => {
    props.api.startEditingCell({
      rowIndex: props.rowIndex,
      colKey: props.column.getId()
    });
  };

  const isInvalid =
    props.node.data.invalid && props.column.colId === props.invalidColumn;
  const tooltipContent = isInvalid
    ? `Invalid value for column type "${props.column.colDef.type}": ${props.value}`
    : null;

  const cellContent = (
    <div
      onClick={handleCellClick}
      onDoubleClick={handleCellClick}
      className={isInvalid ? styles.invalidCell : ''}
    >
      {props.value !== undefined && props.value !== null ? props.value : ''}
    </div>
  );

  return isInvalid ? (
    <Tooltip content={tooltipContent}>{cellContent}</Tooltip>
  ) : (
    cellContent
  );
};

export default CustomCellRenderer;
