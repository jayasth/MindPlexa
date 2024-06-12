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
          const selectedNodes = api.getSelectedNodes();
          if (selectedNodes.length > 0) {
            const selectedData = selectedNodes.map((node) => node.data);
            const clipboardText = JSON.stringify(selectedData);
            navigator.clipboard.writeText(clipboardText).then(() => {
              console.log('Copied to clipboard:', clipboardText);
            });
          }
        } else if (event.ctrlKey && event.key === 'v') {
          navigator.clipboard.readText().then((clipText) => {
            console.log('Pasted text:', clipText);
            const selectedNodes = api.getSelectedNodes();
            if (selectedNodes.length > 0) {
              const rowData = selectedNodes[0].data;
              const focusedCell = api.getFocusedCell();
              const column = api
                .getColumnDefs()
                .find((col) => col.field === focusedCell.column.colId);
              if (column) {
                rowData[column.field] = clipText;
                const updatedRows = content.rows.map((row) =>
                  row.id === rowData.id ? rowData : row
                );
                setContent({ ...content, rows: updatedRows });
              }
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

export const handleKeyDown = (
  event,
  gridRef,
  content,
  setContent,
  updateNode
) => {
  const api = gridRef?.current?.api;
  if (api) {
    const currentCell = api.getFocusedCell();
    const currentRow = currentCell?.rowIndex;
    const currentCol = currentCell?.column;
    const maxRow = api.getDisplayedRowCount() - 1;
    const maxCol = api.getAllDisplayedColumns().length - 1;

    if (currentCell) {
      switch (event.key) {
        case 'ArrowDown':
          if (currentRow < maxRow) {
            api.setFocusedCell(currentRow + 1, currentCol);
          }
          break;
        case 'ArrowUp':
          if (currentRow > 0) {
            api.setFocusedCell(currentRow - 1, currentCol);
          }
          break;
        case 'ArrowRight':
          if (currentCol < maxCol) {
            api.setFocusedCell(currentRow, currentCol + 1);
          }
          break;
        case 'ArrowLeft':
          if (currentCol > 0) {
            api.setFocusedCell(currentRow, currentCol - 1);
          }
          break;
        case 'Enter':
          if (currentRow < maxRow) {
            api.setFocusedCell(currentRow + 1, currentCol);
          }
          break;
        case 'Tab':
          if (currentCol < maxCol) {
            api.setFocusedCell(currentRow, currentCol + 1);
          } else if (currentRow < maxRow) {
            api.setFocusedCell(currentRow + 1, 0);
          }
          break;
        default:
          break;
      }
      event.preventDefault();
      api.refreshCells({ force: true }); // Trigger a re-render to apply the new styles
    }
  }
};

export const onCellKeyDown = (params) => {
  const key = params.event.key;
  const api = params.api;
  const currentCell = api.getFocusedCell();
  const currentRow = currentCell?.rowIndex;
  const currentCol = currentCell?.column;
  const maxRow = api.getDisplayedRowCount() - 1;
  const maxCol = api.getAllDisplayedColumns().length - 1;

  if (currentCell) {
    switch (key) {
      case 'ArrowDown':
        if (currentRow < maxRow) {
          api.setFocusedCell(currentRow + 1, currentCol);
        }
        break;
      case 'ArrowUp':
        if (currentRow > 0) {
          api.setFocusedCell(currentRow - 1, currentCol);
        }
        break;
      case 'ArrowRight':
        if (currentCol < maxCol) {
          api.setFocusedCell(currentRow, currentCol + 1);
        }
        break;
      case 'ArrowLeft':
        if (currentCol > 0) {
          api.setFocusedCell(currentRow, currentCol - 1);
        }
        break;
      case 'Enter':
        if (currentRow < maxRow) {
          api.setFocusedCell(currentRow + 1, currentCol);
        }
        break;
      case 'Tab':
        if (currentCol < maxCol) {
          api.setFocusedCell(currentRow, currentCol + 1);
        } else if (currentRow < maxRow) {
          api.setFocusedCell(currentRow + 1, 0);
        }
        break;
      default:
        break;
    }
    params.event.preventDefault();
    api.refreshCells({ force: true }); // Trigger a re-render to apply the new styles
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
    console.log(
      'KeyboardMouseHandlers: handleCellMouseDown - Mouse down on cell',
      { row: params.node.rowIndex, col: params.colDef.field }
    );
    setStartCell({ row: params.node.rowIndex, col: params.colDef.field });
    setEndCell(null);
  };

  const handleCellMouseOver = (params: any) => {
    if (startCell) {
      console.log(
        'KeyboardMouseHandlers: handleCellMouseOver - Mouse over cell',
        { row: params.node.rowIndex, col: params.colDef.field }
      );
      setEndCell({ row: params.node.rowIndex, col: params.colDef.field });
    }
  };

  const handleCellMouseUp = () => {
    if (startCell && endCell) {
      console.log(
        'KeyboardMouseHandlers: handleCellMouseUp - Range selected from',
        startCell,
        'to',
        endCell
      );
    }
    console.log(
      'KeyboardMouseHandlers: handleCellMouseUp - Mouse up, resetting selection'
    );
    setStartCell(null);
    setEndCell(null);
  };

  const getCellStyle = (params: any) => {
    const focusedCell = params.api.getFocusedCell();
    const isFocused =
      focusedCell &&
      focusedCell.rowIndex === params.rowIndex &&
      focusedCell.column &&
      focusedCell.column.getId() === params.colDef?.field;

    if (isFocused) {
      return { outline: '2px solid #7c3aed', outlineOffset: '-1px' };
    }

    if (startCell && endCell) {
      const { rowIndex, colDef } = params;
      const startRow = Math.min(startCell.row, endCell.row);
      const endRow = Math.max(startCell.row, endCell.row);
      const startCol = Math.min(Number(startCell.col), Number(endCell.col));
      const endCol = Math.max(Number(startCell.col), Number(endCell.col));

      if (
        rowIndex >= startRow &&
        rowIndex <= endRow &&
        colDef &&
        colDef.field >= startCol &&
        colDef.field <= endCol
      ) {
        console.log('KeyboardMouseHandlers: getCellStyle - Cell is in range', {
          rowIndex,
          colDef
        });
        return { backgroundColor: 'lightgray' };
      }
    }

    return {};
  };
  return {
    handleCellMouseDown,
    handleCellMouseOver,
    handleCellMouseUp,
    getCellStyle
  };
};
