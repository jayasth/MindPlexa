import React, { useState, useRef } from 'react';
import { IHeaderParams } from 'ag-grid-community';
import { useContextMenu } from 'react-contexify';
import 'react-contexify/ReactContexify.css';
import styles from '@/ui/nodes/tableNode/styles/CustomHeader.module.css';

const CustomHeader = (props: IHeaderParams) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { show } = useContextMenu({
    id: `header-context-menu-${props.column.getId()}`
  });
  const headerRef = useRef<HTMLDivElement>(null);

  const handleLeftClick = (event: React.MouseEvent) => {
    event.preventDefault();
    setMenuOpen(!menuOpen);
    show({ event, props: { column: props.column } });
  };

  return (
    <div
      className={styles.headerContainer}
      onClick={handleLeftClick}
      ref={headerRef}
    >
      <span>{props.displayName}</span>
      <span className={styles.menuIcon}>{menuOpen ? '▲' : '▼'}</span>
    </div>
  );
};

export default CustomHeader;
