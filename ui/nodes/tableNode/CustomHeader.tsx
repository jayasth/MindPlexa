import React, { useState, useEffect } from 'react';
import { IHeaderParams } from 'ag-grid-community';
import styles from './CustomHeader.module.css';
import { useStore } from '@/app/store/useCanvasStore'; // Import useStore if needed for accessing global state

interface CustomHeaderProps extends IHeaderParams {
  content: any;
  setContent: (content: any) => void;
}

const CustomHeader: React.FC<CustomHeaderProps> = (props) => {
  const [headerName, setHeaderName] = useState(props.displayName);
  const [isContextMenuVisible, setIsContextMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0
  });

  useEffect(() => {
    // Since getColumnGroupState is deprecated, we need to find an alternative way if necessary
    // For now, we will comment out the deprecated usage
    // This is a placeholder for the new logic to handle column group states
  }, [headerName, props.api, props.column]);
  const handleHeaderNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHeaderName(e.target.value);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setIsContextMenuVisible(true);
  };

  const handleChangeType = (newType: string) => {
    // Since setColumnState does not exist, we need to use an alternative method
    // Assuming applyColumnState is the correct method to use
    props.api.applyColumnState({
      state: props.api.getColumnState().map((colState) => {
        if (colState.colId === props.column.getColId()) {
          return { ...colState, type: newType };
        }
        return colState;
      }),
      applyOrder: true
    });
    setIsContextMenuVisible(false);
  };

  return (
    <div className={styles.headerContainer} onContextMenu={handleContextMenu}>
      <input
        type="text"
        value={headerName}
        onChange={handleHeaderNameChange}
        className={styles.headerInput}
      />
      {isContextMenuVisible && (
        <ul
          className={styles.contextMenu}
          style={{ top: contextMenuPosition.y, left: contextMenuPosition.x }}
          onMouseLeave={() => setIsContextMenuVisible(false)}
        >
          <li onClick={() => handleChangeType('text')}>Change to Text</li>
          <li onClick={() => handleChangeType('number')}>Change to Number</li>
          <li onClick={() => handleChangeType('date')}>Change to Date</li>
          <li onClick={() => handleChangeType('boolean')}>Change to Boolean</li>
          <li onClick={() => handleChangeType('currency')}>
            Change to Currency
          </li>
        </ul>
      )}
    </div>
  );
};

export default CustomHeader;
