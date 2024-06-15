import { useState, useCallback } from 'react';

interface RangeSelectionState {
  startRow: number | null;
  startCol: number | null;
  endRow: number | null;
  endCol: number | null;
}

export const useRangeSelection = (gridRef: React.RefObject<any>) => {
  const [selectedRange, setSelectedRange] = useState<RangeSelectionState>({
    startRow: null,
    startCol: null,
    endRow: null,
    endCol: null
  });

  const isValidRange = (range: RangeSelectionState) => {
    return (
      range.startRow !== null &&
      range.startCol !== null &&
      range.endRow !== null &&
      range.endCol !== null
    );
  };

  const updateSelection = (api, newRange: RangeSelectionState) => {
    setSelectedRange(newRange);
    if (isValidRange(newRange)) {
      api.forEachNode((node) => {
        const row = node.rowIndex;
        const col = node.column.getId();
        if (
          newRange.startRow !== null &&
          newRange.endRow !== null &&
          newRange.startCol !== null &&
          newRange.endCol !== null
        ) {
          node.setSelected(
            row >= newRange.startRow &&
              row <= newRange.endRow &&
              col >= newRange.startCol &&
              col <= newRange.endCol
          );
        }
      });
    }
  };

  const handleCellClick = useCallback(
    (event) => {
      const api = gridRef.current?.api;
      if (api) {
        const cell = api.getFocusedCell();
        if (cell) {
          const newRange = event.shiftKey
            ? {
                startRow: selectedRange.startRow || cell.rowIndex,
                startCol: selectedRange.startCol || cell.column.getId(),
                endRow: cell.rowIndex,
                endCol: cell.column.getId()
              }
            : {
                startRow: cell.rowIndex,
                startCol: cell.column.getId(),
                endRow: cell.rowIndex,
                endCol: cell.column.getId()
              };
          updateSelection(api, newRange);
        }
      }
    },
    [selectedRange, setSelectedRange]
  );

  const handleCellMouseDown = useCallback(
    (event) => {
      const api = gridRef.current?.api;
      if (api) {
        const cell = api.getFocusedCell();
        if (cell) {
          updateSelection(api, {
            startRow: cell.rowIndex,
            startCol: cell.column.getId(),
            endRow: cell.rowIndex,
            endCol: cell.column.getId()
          });
        }
      }
    },
    [setSelectedRange]
  );

  const handleCellMouseUp = useCallback(
    (event) => {
      const api = gridRef.current?.api;
      if (api) {
        const cell = api.getFocusedCell();
        if (cell) {
          updateSelection(api, {
            startRow: selectedRange.startRow || cell.rowIndex,
            startCol: selectedRange.startCol || cell.column.getId(),
            endRow: cell.rowIndex,
            endCol: cell.column.getId()
          });
        }
      }
    },
    [selectedRange, setSelectedRange]
  );

  const handleGridKeyDown = useCallback((event) => {
    const api = gridRef.current?.api;
    if (api) {
      if (
        ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(event.key)
      ) {
        const focusedCell = api.getFocusedCell();
        if (focusedCell) {
          const newRow =
            focusedCell.rowIndex +
            (event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0);
          const newCol =
            focusedCell.column.getId() +
            (event.key === 'ArrowRight'
              ? 1
              : event.key === 'ArrowLeft'
                ? -1
                : 0);
          api.setFocusedCell(newRow, newCol);
          api.refreshCells({ force: true });
        }
      }
    }
  }, []);

  const handleGridKeyUp = useCallback(
    (event) => {
      const api = gridRef.current?.api;
      if (api) {
        if (
          ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(
            event.key
          )
        ) {
          const focusedCell = api.getFocusedCell();
          if (focusedCell) {
            const newRow =
              focusedCell.rowIndex +
              (event.key === 'ArrowDown'
                ? 1
                : event.key === 'ArrowUp'
                  ? -1
                  : 0);
            const newCol =
              focusedCell.column.getId() +
              (event.key === 'ArrowRight'
                ? 1
                : event.key === 'ArrowLeft'
                  ? -1
                  : 0);
            updateSelection(api, {
              startRow: selectedRange.startRow || newRow,
              startCol: selectedRange.startCol || newCol,
              endRow: newRow,
              endCol: newCol
            });
          }
        }
      }
    },
    [selectedRange, setSelectedRange]
  );

  const handleGridMouseDown = useCallback(
    (event) => {
      const api = gridRef.current?.api;
      if (api) {
        const focusedCell = api.getFocusedCell();
        if (focusedCell) {
          updateSelection(api, {
            startRow: focusedCell.rowIndex,
            startCol: focusedCell.column.getId(),
            endRow: focusedCell.rowIndex,
            endCol: focusedCell.column.getId()
          });
        }
      }
    },
    [setSelectedRange]
  );

  const handleGridMouseUp = useCallback(
    (event) => {
      const api = gridRef.current?.api;
      if (api) {
        const focusedCell = api.getFocusedCell();
        if (focusedCell) {
          updateSelection(api, {
            startRow: selectedRange.startRow || focusedCell.rowIndex,
            startCol: selectedRange.startCol || focusedCell.column.getId(),
            endRow: focusedCell.rowIndex,
            endCol: focusedCell.column.getId()
          });
        }
      }
    },
    [selectedRange, setSelectedRange]
  );

  return {
    selectedRange,
    setSelectedRange,
    handleCellClick,
    handleCellMouseDown,
    handleCellMouseUp,
    handleGridKeyDown,
    handleGridKeyUp,
    handleGridMouseDown,
    handleGridMouseUp
  };
};
