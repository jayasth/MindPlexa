import React, { useRef, useEffect } from 'react';

const CustomHeader = (props) => {
  const { column, menuIcon, showColumnMenu } = props;
  const headerCellRef = useRef(null);
  const textRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    column.eHeaderCell = headerCellRef.current;
    column.eText = textRef.current;
    column.eMenu = menuRef.current;
  }, [column]);

  return (
    <div className="ag-cell-label-container" role="presentation">
      <span
        ref={headerCellRef}
        className="ag-header-cell-label"
        role="presentation"
      >
        <span ref={textRef} className="ag-header-cell-text" role="columnheader">
          {column.colDef.headerName}
        </span>
        <span
          ref={menuRef}
          className={`ag-header-icon ag-header-cell-menu-button ${menuIcon}`}
          onClick={(event) => showColumnMenu(event, column)}
        ></span>
      </span>
    </div>
  );
};

export default CustomHeader;
