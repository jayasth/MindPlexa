import { useEffect } from 'react';

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
          const focusedCell = api.getFocusedCell();
          if (focusedCell) {
            const rowNode = api.getRowNode(focusedCell.rowIndex);
            const rowData = rowNode.data;
            const clipboardText = Object.values(rowData).join('\t');
            navigator.clipboard.writeText(clipboardText);
            event.preventDefault();
          }
        } else if (event.ctrlKey && event.key === 'v') {
          navigator.clipboard.readText().then((clipText) => {
            const focusedCell = api.getFocusedCell();
            if (focusedCell) {
              const rowNode = api.getRowNode(focusedCell.rowIndex);
              const colId = focusedCell.column.colId;
              const currentValue = rowNode.data[colId];
              const newValue = clipText; // Replace the current value with clipboard text
              rowNode.setDataValue(colId, newValue);
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
