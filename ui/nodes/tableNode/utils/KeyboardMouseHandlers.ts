import { useState, useEffect } from 'react';
import { addRow, addColumn } from '@/ui/nodes/tableNode/utils/TableFunctions';
import { CellStyle } from 'ag-grid-community';

type SelectionPoint = {
  rowIndex: number;
  colIndex: number;
} | null;

export const useCellRangeSelection = (gridRef) => {
  const [selectionStart, setSelectionStart] = useState<SelectionPoint>(null);
  const [selectionEnd, setSelectionEnd] = useState<SelectionPoint>(null);
  const [isSelecting, setIsSelecting] = useState<boolean>(false);

  const onCellMouseDown = (params: any) => {
    if (params.node && params.column) {
      setSelectionStart({
        rowIndex: params.node.rowIndex,
        colIndex: params.columnApi
          .getAllDisplayedColumns()
          .indexOf(params.column)
      });
      setIsSelecting(true);
    }
  };

  const onCellMouseOver = (params: any) => {
    if (isSelecting && params.node && params.column) {
      setSelectionEnd({
        rowIndex: params.node.rowIndex,
        colIndex: params.columnApi
          .getAllDisplayedColumns()
          .indexOf(params.column)
      });
    }
  };

  const onCellMouseOut = () => {
    if (isSelecting) {
      setIsSelecting(false);
    }
  };

  const getCellStyle = (params: any): CellStyle => {
    let style: CellStyle = {};
    if (isCellInRange(params)) {
      style = { backgroundColor: '#c8dafc' };
    }
    return style;
  };

  const isCellInRange = (params: any) => {
    if (!selectionStart || !selectionEnd) return false;
    const inRowRange =
      params.node.rowIndex >=
        Math.min(selectionStart.rowIndex, selectionEnd.rowIndex) &&
      params.node.rowIndex <=
        Math.max(selectionStart.rowIndex, selectionEnd.rowIndex);
    const inColRange =
      params.columnApi.getAllDisplayedColumns().indexOf(params.column) >=
        Math.min(selectionStart.colIndex, selectionEnd.colIndex) &&
      params.columnApi.getAllDisplayedColumns().indexOf(params.column) <=
        Math.max(selectionStart.colIndex, selectionEnd.colIndex);
    return inRowRange && inColRange;
  };

  return { onCellMouseDown, onCellMouseOver, onCellMouseOut, getCellStyle };
};
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
      api.stopEditing();
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
