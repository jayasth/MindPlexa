import React, { useState, useRef, MouseEvent } from 'react';
import { IHeaderParams } from 'ag-grid-community';
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';
import styles from '@/ui/nodes/tableNode/styles/CustomHeader.module.css';

const CustomHeader = (props: IHeaderParams) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  const handleLeftClick = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.type === 'click') {
      setMenuOpen(!menuOpen);
    } else if (event.type === 'contextmenu') {
      props.showColumnMenu(event.currentTarget as HTMLElement);
    }
  };

  return (
    <div
      className={styles.headerContainer}
      onClick={handleLeftClick}
      onContextMenu={handleLeftClick}
      ref={headerRef}
      tabIndex={0}
    >
      <span>{props.displayName}</span>
      <span className={styles.menuIcon}>
        {menuOpen ? <IoChevronUp /> : <IoChevronDown />}
      </span>
    </div>
  );
};

export default CustomHeader;
