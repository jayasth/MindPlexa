import React, { useState, useCallback } from 'react';
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

  const handleHeaderNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newName = e.target.value;
      setHeaderName(newName);
      column.setColumn({ name: newName });
    },
    [column]
  );

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setIsContextMenuVisible(true);
  }, []);

  const handleChangeType = useCallback(
    (newType: string) => {
      column.setColumn({ type: newType });
      setIsContextMenuVisible(false);
    },
    [column]
  );

  const contextMenuOptions = [
    { label: 'Change to Text', type: 'text' },
    { label: 'Change to Number', type: 'number' },
    { label: 'Change to Date', type: 'date' },
    { label: 'Change to Boolean', type: 'boolean' },
    { label: 'Change to Currency', type: 'currency' }
  ];

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
          {contextMenuOptions.map((option) => (
            <li key={option.type} onClick={() => handleChangeType(option.type)}>
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomHeader;
