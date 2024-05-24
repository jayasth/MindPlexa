import React, { useState } from 'react';

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

  const handleRightClick = (e) => {
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

  return (
    <div onContextMenu={handleRightClick} style={{ position: 'relative' }}>
      <input
        type="text"
        value={headerName}
        onChange={onHeaderNameChange}
        style={{ width: '100%', border: 'none', background: 'transparent' }}
      />
      {isContextMenuVisible && (
        <ul
          style={{
            position: 'absolute',
            top: contextMenuPosition.y,
            left: contextMenuPosition.x,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            listStyle: 'none',
            padding: '5px',
            zIndex: 1000
          }}
          onMouseLeave={() => setIsContextMenuVisible(false)}
        >
          <li
            onClick={handleRename}
            style={{ padding: '5px', cursor: 'pointer' }}
          >
            Rename
          </li>
          <li
            onClick={() => handleChangeType('text')}
            style={{ padding: '5px', cursor: 'pointer' }}
          >
            Change to Text
          </li>
          <li
            onClick={() => handleChangeType('number')}
            style={{ padding: '5px', cursor: 'pointer' }}
          >
            Change to Number
          </li>
          <li
            onClick={() => handleChangeType('date')}
            style={{ padding: '5px', cursor: 'pointer' }}
          >
            Change to Date
          </li>
        </ul>
      )}
    </div>
  );
};

export default CustomHeader;
