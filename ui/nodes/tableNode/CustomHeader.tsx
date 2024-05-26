import React, { useState } from 'react';
import styles from './CustomHeader.module.css';

interface CustomHeaderProps {
  column: {
    name: string;
    type: string;
    setColumn: (col: { name?: string; type?: string }) => void;
  };
}

const CustomHeader: React.FC<CustomHeaderProps> = ({ column }) => {
  const [headerName, setHeaderName] = useState(column.name);
  const [isContextMenuVisible, setIsContextMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0
  });

  const handleHeaderNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHeaderName(e.target.value);
    column.setColumn({ name: e.target.value });
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setIsContextMenuVisible(true);
  };

  const handleChangeType = (newType: string) => {
    column.setColumn({ type: newType });
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
