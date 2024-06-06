import React, { useState, useRef, useEffect } from 'react';
import { IHeaderParams } from 'ag-grid-community';
import styles from '@/ui/nodes/tableNode/styles/CustomHeaderComponent.module.css';

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
        </div>
      )}
    </div>
  );
};

export default CustomHeaderComponent;
