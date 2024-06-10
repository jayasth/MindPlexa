import { useEffect, useState } from 'react';
import { addRow, addColumn } from '@/ui/nodes/tableNode/utils/TableFunctions';

export const useKeyPressHandler = (
  content,
  setContent,
  updateNode,
  gridRef
) => {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'n') {
        addRow(content, setContent, updateNode);
      } else if (event.ctrlKey && event.key === 'm') {
        addColumn(content, setContent, updateNode);
      } else if (event.ctrlKey && event.key === 'd') {
        // Delete selected row
        const api = gridRef.current?.api;
        if (api) {
          const selectedRows = api.getSelectedRows();
          if (selectedRows.length > 0) {
            const updatedRows = content.rows.filter(
              (_, index) =>
                !selectedRows.some((row) => row.id === content.rows[index].id)
            );
            setContent({ ...content, rows: updatedRows });
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [content, setContent, updateNode, gridRef]);
};

export const handleKeyDown = (event, gridRef) => {
  const api = gridRef.current?.api;
  if (api) {
    if (
      [
        'ArrowUp',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        'Enter',
        'Tab'
      ].includes(event.key)
    ) {
      api.stopEditing(); // Commit editing before moving
    }
    switch (event.key) {
      case 'ArrowUp':
        api.tabToPreviousCell();
        break;
      case 'ArrowDown':
      case 'Enter':
        api.tabToNextCell();
        break;
      case 'ArrowLeft':
        api.tabToPreviousCell();
        break;
      case 'ArrowRight':
        api.tabToNextCell();
        break;
      case 'Tab':
        api.tabToNextCell();
        break;
      case 'Escape':
        api.stopEditing();
        break;
      default:
        break;
    }
  }
};

export const onCellKeyDown = (params) => {
  const key = params.event.key;
  if (
    key === 'Enter' ||
    key === 'Tab' ||
    key === 'ArrowRight' ||
    key === 'ArrowLeft' ||
    key === 'ArrowUp' ||
    key === 'ArrowDown'
  ) {
    params.api.stopEditing();
    const currentCell = params.api.getFocusedCell();
    const currentRow = currentCell?.rowIndex;
    const currentCol = currentCell?.column;
    const maxRow = params.api.getModel().getRowCount() - 1;
    const maxCol = params.columnApi.getAllDisplayedColumns().length - 1;

    switch (key) {
      case 'Enter':
        if (
          currentRow !== undefined &&
          currentRow < maxRow &&
          currentCol !== undefined
        ) {
          params.api.setFocusedCell(currentRow + 1, currentCol);
        }
        break;
      case 'ArrowDown':
        if (
          currentRow !== undefined &&
          currentRow < maxRow &&
          currentCol !== undefined
        ) {
          params.api.setFocusedCell(currentRow + 1, currentCol);
        }
        break;
      case 'ArrowUp':
        if (
          currentRow !== undefined &&
          currentRow > 0 &&
          currentCol !== undefined
        ) {
          params.api.setFocusedCell(currentRow - 1, currentCol);
        }
        break;
      case 'Tab':
        if (
          currentRow !== undefined &&
          currentRow < maxRow &&
          currentCol !== undefined
        ) {
          params.api.setFocusedCell(currentRow, currentCol);
        }
        break;
      case 'ArrowRight':
        params.api.tabToNextCell();
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        params.api.tabToPreviousCell();
        break;
    }
    params.event.preventDefault();
  }
};

export const handleCellClick = (event) => {
  console.log('Cell clicked', event);
  // Add any additional logic for single cell click
};

export const handleCellDoubleClick = (event) => {
  console.log('Cell double-clicked', event);
  // Add any additional logic for double cell click
};

export const handleCellContextMenu = (
  event,
  params,
  setContextMenuPosition,
  setContextMenuParams,
  setIsContextMenuOpen
) => {
  event.preventDefault();
  console.log('KeyboardMouseHandlers: Cell context menu triggered');
  setContextMenuPosition({
    x: event.clientX,
    y: event.clientY
  });
  setContextMenuParams(params);
  setIsContextMenuOpen(true);
};

// New functions for selecting cells/rows/columns and adding rows/columns on click and drag
export const handleMouseDown = (event, params, setSelectionRange) => {
  const startCell = params.api.getFocusedCell();
  setSelectionRange({ start: startCell, end: startCell });
};

export const handleMouseMove = (
  event,
  params,
  selectionRange,
  setSelectionRange
) => {
  if (selectionRange.start) {
    const endCell = params.api.getFocusedCell();
    setSelectionRange({ ...selectionRange, end: endCell });
  }
};

export const handleMouseUp = (
  event,
  params,
  selectionRange,
  setSelectionRange
) => {
  if (selectionRange.start && selectionRange.end) {
    // Handle selection logic here
    console.log('Selection range:', selectionRange);
  }
  setSelectionRange({ start: null, end: null });
};

export const handleAddRowOrColumn = (event, params, setContent, content) => {
  const { rowIndex, colDef } = params;
  if (event.target.classList.contains('add-row')) {
    addRow(content, setContent, params.api);
  } else if (event.target.classList.contains('add-column')) {
    addColumn(content, setContent, params.api, colDef.type);
  }
};
