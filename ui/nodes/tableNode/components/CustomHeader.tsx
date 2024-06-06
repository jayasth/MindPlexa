import React, { useRef, MouseEvent } from 'react';
import { IHeaderParams } from 'ag-grid-community';
import { IoChevronDown } from 'react-icons/io5';
import styles from '@/ui/nodes/tableNode/styles/CustomHeader.module.css';

const CustomHeader = (props: IHeaderParams) => {
  const headerRef = useRef<HTMLDivElement>(null);

  const handleLeftClick = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    props.showColumnMenu(event.currentTarget as HTMLElement);
  };

  return (
    <div
      className={styles.headerContainer}
      onClick={handleLeftClick}
      ref={headerRef}
      tabIndex={0}
    >
      <span>{props.displayName}</span>
      <span className={styles.menuIcon}>
        <IoChevronDown />
      </span>
    </div>
  );
};

export default CustomHeader;
