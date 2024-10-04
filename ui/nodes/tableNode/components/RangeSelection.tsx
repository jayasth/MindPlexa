import React, { useState, useEffect, useRef } from 'react';
import styles from '@/ui/nodes/tableNode/styles/RangeSelection.module.css';

interface RangeSelectionProps {
  gridRef: React.RefObject<{
    api: {
      getFocusedCell: () => {
        rowIndex: number;
        column: { getId: () => string };
      } | null;
      forEachNode: (
        callback: (node: {
          rowIndex: number;
          columnApi: { getAllColumns: () => { getId: () => string }[] };
        }) => void
      ) => void;
      getCellRendererInstances: (params: {
        rowNodes: Array<{ rowIndex: number }>;
        columns: Array<{ getId: () => string }>;
      }) => Array<{
        eGui: {
          classList: {
            toggle: (className: string, condition: boolean) => void;
          };
        };
      }>;
      getColumnLeft: (colId: string) => number;
      getRowTop: (rowIndex: number) => number;
      getColumnWidth: (colId: string) => number;
      getRowHeight: (rowIndex: number) => number;
      deselectAll: () => void;
    };
  }>;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
}

const RangeSelection: React.FC<RangeSelectionProps> = ({
  gridRef,
  setIsEditing
}) => {
  const [selectedRange, setSelectedRange] = useState<{
    startRow: number;
    startCol: string;
    endRow: number;
    endCol: string;
  }>({
    startRow: -1,
    startCol: '',
    endRow: -1,
    endCol: ''
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ row: number; col: string } | null>(null);

  const isValidRange = () =>
    selectedRange.startRow >= 0 &&
    selectedRange.endRow >= 0 &&
    selectedRange.startCol &&
    selectedRange.endCol;

  const updateSelection = (newRange: {
    startRow: number;
    startCol: string;
    endRow: number;
    endCol: string;
  }) => {
    setSelectedRange(newRange);
    const api = gridRef.current?.api;
    if (api && isValidRange()) {
      api.forEachNode((node) => {
        const row = node.rowIndex;
        node.columnApi.getAllColumns().forEach((col) => {
          const colId = col.getId();
          const isSelected =
            row >= newRange.startRow &&
            row <= newRange.endRow &&
            colId >= newRange.startCol &&
            colId <= newRange.endCol;
          api
            .getCellRendererInstances({ rowNodes: [node], columns: [col] })
            .forEach((cellRenderer) => {
              cellRenderer.eGui.classList.toggle(
                styles.selectedCell,
                isSelected
              );
            });
        });
      });
    }
  };

  const handleCellClick = (event: React.MouseEvent) => {
    const api = gridRef.current?.api;
    const cell = api?.getFocusedCell();
    if (cell) {
      const newRange = {
        startRow: event.shiftKey ? selectedRange.startRow : cell.rowIndex,
        startCol: event.shiftKey ? selectedRange.startCol : cell.column.getId(),
        endRow: cell.rowIndex,
        endCol: cell.column.getId()
      };
      updateSelection(newRange);
      setIsEditing(false);
    }
  };

  const handleCellMouseDown = () => {
    const api = gridRef.current?.api;
    const cell = api?.getFocusedCell();
    if (cell) {
      dragStartRef.current = { row: cell.rowIndex, col: cell.column.getId() };
      setIsDragging(true);
      updateSelection({
        startRow: cell.rowIndex,
        startCol: cell.column.getId(),
        endRow: cell.rowIndex,
        endCol: cell.column.getId()
      });
    }
  };

  const handleCellMouseUp = () => {
    const api = gridRef.current?.api;
    const cell = api?.getFocusedCell();
    if (cell) {
      updateSelection({
        startRow: dragStartRef.current?.row ?? cell.rowIndex,
        startCol: dragStartRef.current?.col ?? cell.column.getId(),
        endRow: cell.rowIndex,
        endCol: cell.column.getId()
      });
    }
    setIsDragging(false);
  };

  const handleCellMouseMove = () => {
    const api = gridRef.current?.api;
    if (isDragging && dragStartRef.current) {
      const cell = api?.getFocusedCell();
      if (cell) {
        updateSelection({
          startRow: dragStartRef.current.row,
          startCol: dragStartRef.current.col,
          endRow: cell.rowIndex,
          endCol: cell.column.getId()
        });
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const api = gridRef.current?.api;
      if (api && event.key === 'Escape') {
        setSelectedRange({
          startRow: -1,
          startCol: '',
          endRow: -1,
          endCol: ''
        });
        api.deselectAll();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [gridRef]);

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div
      className={styles.rangeSelection}
      onMouseDown={handleCellMouseDown}
      onMouseUp={handleCellMouseUp}
      onMouseMove={handleCellMouseMove}
      onClick={handleCellClick}
    >
      {isValidRange() && (
        <div
          className={styles.selectionOverlay}
          style={{
            left: `${gridRef.current?.api.getColumnLeft(selectedRange.startCol) ?? 0}px`,
            top: `${gridRef.current?.api.getRowTop(selectedRange.startRow) ?? 0}px`,
            width: `${(gridRef.current?.api.getColumnLeft(selectedRange.endCol) ?? 0) - (gridRef.current?.api.getColumnLeft(selectedRange.startCol) ?? 0) + (gridRef.current?.api.getColumnWidth(selectedRange.endCol) ?? 0)}px`,
            height: `${(gridRef.current?.api.getRowTop(selectedRange.endRow) ?? 0) - (gridRef.current?.api.getRowTop(selectedRange.startRow) ?? 0) + (gridRef.current?.api.getRowHeight(selectedRange.endRow) ?? 0)}px`
          }}
        />
      )}
    </div>
  );
};

export default RangeSelection;
