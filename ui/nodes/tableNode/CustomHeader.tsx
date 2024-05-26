import React, { useState } from 'react';
import styles from './CustomHeader.module.css';

const CustomHeader = (props) => {
  const [headerName, setHeaderName] = useState(props.displayName);
  const [isContextMenuVisible, setIsContextMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0
  });

  const onHeaderNameChange = (e) => {
    setHeaderName(e.target.value);
    const newColumns = props.content.columns.map((col) => {
      if (col.field === props.column.colId) {
        return { ...col, headerName: e.target.value };
      }
      return col;
    });
    props.setContent({ ...props.content, columns: newColumns });
  };

  const handleDropdownClick = (e) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setIsContextMenuVisible(true);
  };

  const handleRename = () => {
    const newHeaderName = prompt('Enter new header name:', headerName);
    if (newHeaderName !== null) {
      setHeaderName(newHeaderName);
      const newColumns = props.content.columns.map((col) => {
        if (col.field === props.column.colId) {
          return { ...col, headerName: newHeaderName };
        }
        return col;
      });
      props.setContent({ ...props.content, columns: newColumns });
    }
    setIsContextMenuVisible(false);
  };

  const handleChangeType = (newType) => {
    const newColumns = props.content.columns.map((col) => {
      if (col.field === props.column.colId) {
        return { ...col, type: newType };
      }
      return col;
    });
    props.setContent({ ...props.content, columns: newColumns });
    setIsContextMenuVisible(false);
  };

  const handleSort = () => {
    // Implement sorting logic here
    setIsContextMenuVisible(false);
  };

  const handleFilter = () => {
    // Implement filtering logic here
    setIsContextMenuVisible(false);
  };

  const handleRightClick = (e) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setIsContextMenuVisible(true);
  };

  return (
    <div className={styles.headerContainer} onContextMenu={handleRightClick}>
      <input
        type="text"
        value={headerName}
        onChange={onHeaderNameChange}
        className={styles.headerInput}
      />
      <div className={styles.iconsContainer}>
        <div className={styles.filterIcon} onClick={handleFilter}>
          🔍
        </div>
        <div className={styles.sortIcon} onClick={handleSort}>
          ▼
        </div>
      </div>
      {isContextMenuVisible && (
        <ul
          className={styles.contextMenu}
          style={{
            top: contextMenuPosition.y,
            left: contextMenuPosition.x
          }}
          onMouseLeave={() => setIsContextMenuVisible(false)}
        >
          <li onClick={handleRename}>Rename</li>
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
