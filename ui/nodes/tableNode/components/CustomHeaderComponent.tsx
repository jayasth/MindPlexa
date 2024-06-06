import React, { useState, useRef, useEffect } from 'react';
import { IHeaderParams } from 'ag-grid-community';
import { useContextMenu } from 'react-contexify';
import 'react-contexify/ReactContexify.css';
import styles from '@/ui/nodes/tableNode/styles/CustomHeaderComponent.module.css';

const CustomHeaderComponent = (props: IHeaderParams) => {
  const { show } = useContextMenu({
    id: `header-context-menu-${props.column.getId()}`
  });

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    show({ event });
  };

  return (
    <div className={styles.headerContainer} onContextMenu={handleContextMenu}>
      <span>{props.displayName}</span>
    </div>
  );
};

export default CustomHeaderComponent;
