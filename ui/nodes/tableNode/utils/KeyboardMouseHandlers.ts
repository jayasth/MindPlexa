import { useState, useEffect } from 'react';
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

interface Cell {
  row: number;
  col: string;
}

export const useRangeSelection = (setContent) => {
  const [startCell, setStartCell] = useState<Cell | null>(null);
  const [endCell, setEndCell] = useState<Cell | null>(null);

  const handleCellMouseDown = (params: any) => {
    setStartCell({ row: params.node.rowIndex, col: params.colDef.field });
    setEndCell(null);
  };

  const handleCellMouseOver = (params: any) => {
    if (startCell) {
      setEndCell({ row: params.node.rowIndex, col: params.colDef.field });
    }
  };

  const handleCellMouseOut = () => {
    // Perform any action on mouse up if needed
  };

  const getCellStyle = (params: any) => {
    if (startCell && endCell) {
      const { rowIndex, colDef } = params;
      const startRow = Math.min(startCell.row, endCell.row);
      const endRow = Math.max(startCell.row, endCell.row);
      const startCol = Math.min(Number(startCell.col), Number(endCell.col));
      const endCol = Math.max(Number(startCell.col), Number(endCell.col));

      if (
        rowIndex >= startRow &&
        rowIndex <= endRow &&
        colDef.field >= startCol &&
        colDef.field <= endCol
      ) {
        return { backgroundColor: 'lightgray' };
      }
    }
    return {};
  };

  return {
    handleCellMouseDown,
    handleCellMouseOver,
    handleCellMouseOut,
    getCellStyle
  };
};
