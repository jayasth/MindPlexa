import { useEffect } from 'react';
import { addRow, addColumn } from '@/ui/nodes/tableNode/utils/TableFunctions';

export const useKeyPressHandler = (
  content,
  setContent,
  updateNode,
  gridRef
) => {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const api = gridRef?.current?.api;
      if (api) {
        if (event.ctrlKey && event.key === 'n') {
          addRow(content, setContent, updateNode);
        } else if (event.ctrlKey && event.key === 'm') {
          addColumn(content, setContent, updateNode);
        } else if (event.ctrlKey && event.key === 'd') {
          const selectedRows = api.getSelectedRows();
          if (selectedRows.length > 0) {
            const updatedRows = content.rows.filter(
              (_, index) =>
                !selectedRows.some((row) => row.id === content.rows[index].id)
            );
            setContent({ ...content, rows: updatedRows });
          }
        } else if (event.ctrlKey && event.key === 'a') {
          api.selectAll();
        } else if (event.ctrlKey && event.key === 'c') {
          api.copySelectedRangeToClipboard();
        } else if (event.ctrlKey && event.key === 'v') {
          api.pasteFromClipboard();
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [content, setContent, updateNode, gridRef]);
};

export const handleKeyDown = (
  event,
  gridRef,
  content,
  setContent,
  updateNode
) => {
  const api = gridRef?.current?.api;
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

    if (event.key === 'Enter') {
      const currentCell = api.getFocusedCell();
      const currentRow = currentCell?.rowIndex;
      const maxRow = api.getModel().getRowCount() - 1;
      if (currentRow === maxRow) {
        addRow(content, setContent, updateNode);
      }
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

export const handleMouseDown = (params, setSelectionRange) => {
  const cell = params.api.getFocusedCell();
  if (cell) {
    setSelectionRange({ start: cell, end: cell });
  }
};

export const handleMouseMove = (params, selectionRange, setSelectionRange) => {
  if (selectionRange.start) {
    const cell = params.api.getFocusedCell();
    if (cell) {
      setSelectionRange({ ...selectionRange, end: cell });
      params.api.addCellRange({
        rowStartIndex: selectionRange.start.rowIndex,
        rowEndIndex: cell.rowIndex,
        columnStart: selectionRange.start.column,
        columnEnd: cell.column
      });
    }
  }
};

export const handleMouseUp = (
  params,
  gridRef,
  selectionRange,
  setSelectionRange
) => {
  setSelectionRange({ start: null, end: null });
};

export const handleAddRowOrColumn = (
  event,
  gridRef,
  content,
  setContent,
  updateNode
) => {
  const api = gridRef?.current?.api;
  if (api) {
    const cellRange = api.getCellRanges()[0];
    if (cellRange) {
      const { rowStartIndex, rowEndIndex, columnStart, columnEnd } = cellRange;
      if (rowStartIndex === rowEndIndex && columnStart === columnEnd) {
        // Single cell selected
        if (event.target.classList.contains('add-row')) {
          addRow(content, setContent, updateNode);
        } else if (event.target.classList.contains('add-column')) {
          addColumn(content, setContent, updateNode, columnStart.colDef.type);
        }
      } else {
        // Range selected
        if (event.target.classList.contains('add-row')) {
          const numRows = rowEndIndex - rowStartIndex + 1;
          for (let i = 0; i < numRows; i++) {
            addRow(content, setContent, updateNode);
          }
        } else if (event.target.classList.contains('add-column')) {
          const numCols = columnEnd.columnIndex - columnStart.columnIndex + 1;
          for (let i = 0; i < numCols; i++) {
            addColumn(content, setContent, updateNode, columnStart.colDef.type);
          }
        }
      }
    }
  }
};
