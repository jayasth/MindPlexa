import React, { useState, useRef, useEffect } from 'react';
import { IHeaderParams } from 'ag-grid-community';
import styles from '@/ui/nodes/tableNode/styles/CustomHeaderComponent.module.css';
import CustomContextMenu from '@/ui/nodes/tableNode/components/CustomContextMenu';

const CustomHeaderComponent = (props: IHeaderParams) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setShowMenu(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const sortColumn = (order: 'asc' | 'desc') => {
    props.api.applyColumnState({
      state: [{ colId: props.column.getId(), sort: order }],
      applyOrder: true
    });
    setShowMenu(false);
  };

  const filterColumn = () => {
    // Implement your custom filter logic here
    alert('Filter logic not implemented');
    setShowMenu(false);
  };

  const handleRename = () => {
    // Implement your rename logic here
    alert('Rename logic not implemented');
  };

  const handleChangeType = () => {
    // Implement your change type logic here
    alert('Change type logic not implemented');
  };

  const handleDelete = () => {
    // Implement your delete logic here
    alert('Delete logic not implemented');
  };

  return (
    <div className={styles.headerContainer}>
      <span>{props.displayName}</span>
      <button onClick={toggleMenu} className={styles.menuButton}>
        ☰
      </button>
      {showMenu && (
        <div ref={menuRef} className={styles.contextMenu}>
          <div
            className={styles.contextMenuItem}
            onClick={() => sortColumn('asc')}
          >
            Sort Ascending
          </div>
          <div
            className={styles.contextMenuItem}
            onClick={() => sortColumn('desc')}
          >
            Sort Descending
          </div>
          <div className={styles.contextMenuItem} onClick={filterColumn}>
            Filter
          </div>
          <CustomContextMenu
            id="custom-header-context-menu"
            onRename={handleRename}
            onChangeType={handleChangeType}
            onDelete={handleDelete}
          />
        </div>
      )}
    </div>
  );
};

export default CustomHeaderComponent;
