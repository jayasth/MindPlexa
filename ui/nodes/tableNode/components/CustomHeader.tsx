import React, { useState, useRef } from 'react';
import { IHeaderParams } from 'ag-grid-community';
import { useContextMenu } from 'react-contexify';
import 'react-contexify/ReactContexify.css';
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';
import styles from '@/ui/nodes/tableNode/styles/CustomHeader.module.css';

const CustomHeader = (props: IHeaderParams) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { show, hideAll } = useContextMenu({
    id: `header-context-menu-${props.column.getId()}`
  });
  const headerRef = useRef<HTMLDivElement>(null);

  const handleLeftClick = (event: React.MouseEvent) => {
    event.preventDefault();
    const rect = headerRef.current?.getBoundingClientRect();
    if (menuOpen) {
      hideAll();
    } else {
      const xOffset = rect ? rect.left + window.scrollX : event.clientX;
      const yOffset = rect ? rect.bottom + window.scrollY : event.clientY;

      show({
        event,
        props: { column: props.column },
        position: {
          x: xOffset,
          y: yOffset
        }
      });
    }
    setMenuOpen(!menuOpen);
  };
  return (
    <div
      className={styles.headerContainer}
      onClick={handleLeftClick}
      ref={headerRef}
      tabIndex={0} // Make the header focusable
    >
      <span>{props.displayName}</span>
      <span className={styles.menuIcon}>
        {menuOpen ? <IoChevronUp /> : <IoChevronDown />}
      </span>
    </div>
  );
};

export default CustomHeader;
