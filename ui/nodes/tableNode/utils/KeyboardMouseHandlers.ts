import { useState, useEffect } from 'react';
import { addRow, addColumn } from '@/ui/nodes/tableNode/utils/TableFunctions';
import debounce from 'lodash.debounce';

interface Range {
  startRow: number;
  endRow: number;
  startCol: number;
  endCol: number;
}

interface Cell {
  row: number;
  col: number;
}

export const useRangeSelection = (
  setContent,
  gridRef: React.RefObject<any>
) => {
  const [ranges, setRanges] = useState<Range[]>([]);
  const [currentRange, setCurrentRange] = useState<Range | null>(null);
  const [startCell, setStartCell] = useState<Cell | null>(null);
  const [endCell, setEndCell] = useState<Cell | null>(null);
  const [isShiftKeyDown, setIsShiftKeyDown] = useState(false);

  const handleCellMouseDown = (params: any) => {
    console.log(
      'KeyboardMouseHandlers: handleCellMouseDown called with params:',
      params
    );
    const { rowIndex, colDef } = params;
    setStartCell({ row: rowIndex, col: colDef.field });
    setEndCell(null);
    setCurrentRange({
      startRow: rowIndex,
      endRow: rowIndex,
      startCol: colDef.field,
      endCol: colDef.field
    });
  };

  const handleCellMouseOver = debounce((params: any) => {
    console.log(
      'KeyboardMouseHandlers: handleCellMouseOver called with params:',
      params
    );
    if (startCell && currentRange) {
      const { rowIndex, colDef } = params;
      setEndCell({ row: rowIndex, col: colDef.field });
      setCurrentRange({
        ...currentRange,
        endRow: rowIndex,
        endCol: colDef.field
      });
    }
  }, 50);

  const handleCellMouseUp = () => {
    console.log('KeyboardMouseHandlers: handleCellMouseUp called');
    if (currentRange) {
      setRanges([...ranges, currentRange]);
    }
    setStartCell(null);
    setEndCell(null);
    setCurrentRange(null);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    console.log(
      'KeyboardMouseHandlers: handleKeyDown called with event:',
      event
    );
    const { key, shiftKey } = event;
    const api = gridRef.current.api;
    const currentCell = api.getFocusedCell();

    if (shiftKey) {
      setIsShiftKeyDown(true);
      if (currentCell && startCell) {
        const { rowIndex, column } = currentCell;
        setEndCell({ row: rowIndex, col: column.colId });
        setCurrentRange({
          startRow: startCell.row,
          endRow: rowIndex,
          startCol: startCell.col,
          endCol: column.colId
        });
      }
    } else if (
      key === 'ArrowUp' ||
      key === 'ArrowDown' ||
      key === 'ArrowLeft' ||
      key === 'ArrowRight'
    ) {
      setStartCell(null);
      setEndCell(null);
      setCurrentRange(null);
    }
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    console.log('KeyboardMouseHandlers: handleKeyUp called with event:', event);
    const { shiftKey } = event;
    if (!shiftKey) {
      setIsShiftKeyDown(false);
      if (currentRange) {
        setRanges([...ranges, currentRange]);
        setCurrentRange(null);
      }
    }
  };

  const getCellStyle = (params: any) => {
    console.log(
      'KeyboardMouseHandlers: getCellStyle called with params:',
      params
    );
    const { rowIndex, colDef } = params;
    if (!colDef || !colDef.field) {
      return {};
    }

    const isFocused =
      params.api.getFocusedCell()?.rowIndex === rowIndex &&
      params.api.getFocusedCell()?.column.getId() === colDef.field;

    if (isFocused) {
      return { outline: '2px solid #7c3aed', outlineOffset: '-1px' };
    }

    const isInRange = ranges.some(
      (range) =>
        rowIndex >= range.startRow &&
        rowIndex <= range.endRow &&
        colDef.field >= range.startCol &&
        colDef.field <= range.endCol
    );

    if (isInRange) {
      return { backgroundColor: 'rgba(124, 58, 237, 0.2)' };
    }

    if (
      currentRange &&
      rowIndex >= currentRange.startRow &&
      rowIndex <= currentRange.endRow &&
      colDef.field >= currentRange.startCol &&
      colDef.field <= currentRange.endCol
    ) {
      return { backgroundColor: 'rgba(124, 58, 237, 0.4)' };
    }

    return {};
  };

  useEffect(() => {
    console.log('KeyboardMouseHandlers: useEffect called');
    if (!gridRef.current || !gridRef.current.api) {
      return;
    }

    const api = gridRef.current.api;
    const handleGridReady = () => {
      console.log('KeyboardMouseHandlers: handleGridReady called');
      api.addEventListener('cellMouseDown', handleCellMouseDown);
      api.addEventListener('cellMouseOver', handleCellMouseOver);
      api.addEventListener('cellMouseUp', handleCellMouseUp);
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
    };

    const handleGridDestroyed = () => {
      console.log('KeyboardMouseHandlers: handleGridDestroyed called');
      api.removeEventListener('cellMouseDown', handleCellMouseDown);
      api.removeEventListener('cellMouseOver', handleCellMouseOver);
      api.removeEventListener('cellMouseUp', handleCellMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };

    handleGridReady();

    return () => {
      handleGridDestroyed();
    };
  }, [
    handleCellMouseDown,
    handleCellMouseOver,
    handleCellMouseUp,
    handleKeyDown,
    handleKeyUp,
    gridRef
  ]);

  return { getCellStyle };
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
        if (event.ctrlKey && event.key === 'a') {
          api.selectAll();
          event.preventDefault(); // Prevent default to ensure grid handles the event
        } else if (event.ctrlKey && event.key === 'c') {
          const selectedNodes = api.getSelectedNodes();
          if (selectedNodes.length > 0) {
            const clipboardText = selectedNodes
              .map((node) => {
                const rowIndex = node.rowIndex;
                const rowData = api.getDisplayedRowAtIndex(rowIndex).data;
                return Object.values(rowData).join('\t');
              })
              .join('\n');
            navigator.clipboard.writeText(clipboardText);
            event.preventDefault();
          }
        } else if (event.ctrlKey && event.key === 'v') {
          navigator.clipboard.readText().then((clipText) => {
            const focusedCell = api.getFocusedCell();
            if (focusedCell) {
              const rowNode = api.getRowNode(focusedCell.rowIndex);
              const colId = focusedCell.column.colId;
              rowNode.setDataValue(colId, clipText);
              api.refreshCells({ force: true });
              event.preventDefault();
            }
          });
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [content, setContent, updateNode, gridRef]);
};
export const onCellKeyDown = (params) => {
  const key = params.event.key;
  const api = params.api;
  const currentCell = api.getFocusedCell();
  const currentRow = currentCell?.rowIndex;
  const currentCol = currentCell?.column;
  const maxRow = api.getDisplayedRowCount() - 1;
  const maxCol = api.getAllDisplayedColumns().length - 1;
  const isEditing = api
    .getEditingCells()
    .some(
      (cell) =>
        cell.rowIndex === currentRow &&
        cell.column.getId() === currentCol.getId()
    );

  if (currentCell) {
    switch (key) {
      case 'ArrowDown':
        if (isEditing && currentRow < maxRow) {
          api.setFocusedCell(currentRow + 1, currentCol);
        }
        break;
      case 'ArrowUp':
        if (isEditing && currentRow > 0) {
          api.setFocusedCell(currentRow - 1, currentCol);
        }
        break;
      case 'Enter':
        if (currentRow < maxRow) {
          api.setFocusedCell(currentRow + 1, currentCol);
        }
        break;
      case 'Tab':
        if (isEditing && currentRow < maxRow) {
          api.setFocusedCell(currentRow, currentCol + 1);
        }
        break;
      default:
        break;
    }
    api.refreshCells({ force: true });
  }
};
