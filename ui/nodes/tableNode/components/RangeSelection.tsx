import React, { useState, useEffect, useRef } from 'react';
import styles from '@/ui/nodes/tableNode/styles/RangeSelection.module.css';

interface RangeSelectionProps {
  gridRef: React.RefObject<any>;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
}

interface RangeSelectionState {
  startRow: number | null;
  startCol: number | null;
  endRow: number | null;
  endCol: number | null;
}

const RangeSelection: React.FC<RangeSelectionProps> = ({
  gridRef,
  isEditing,
  setIsEditing
}) => {
  const [selectedRange, setSelectedRange] = useState<RangeSelectionState>({
    startRow: null,
    startCol: null,
    endRow: null,
    endCol: null
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ row: number; col: number } | null>(null);

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

  const handleCellClick = (event: React.MouseEvent) => {
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
        setIsEditing(false);
      }
    }
  };

  const handleCellMouseDown = (event: React.MouseEvent) => {
    const api = gridRef.current?.api;
    if (api) {
      const cell = api.getFocusedCell();
      if (cell) {
        dragStartRef.current = { row: cell.rowIndex, col: cell.column.getId() };
        setIsDragging(true);
        updateSelection(api, {
          startRow: cell.rowIndex,
          startCol: cell.column.getId(),
          endRow: cell.rowIndex,
          endCol: cell.column.getId()
        });
      }
    }
  };

  const handleCellMouseUp = (event: React.MouseEvent) => {
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
      setIsDragging(false);
    }
  };

  const handleCellMouseMove = (event: React.MouseEvent) => {
    const api = gridRef.current?.api;
    if (api && isDragging && dragStartRef.current) {
      const cell = api.getFocusedCell();
      if (cell) {
        updateSelection(api, {
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
      if (api) {
        if (event.key === 'Escape') {
          setSelectedRange({
            startRow: null,
            startCol: null,
            endRow: null,
            endCol: null
          });
          api.deselectAll();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [gridRef]);

  useEffect(() => {
    const handleMouseUp = (event: MouseEvent) => {
      setIsDragging(false);
    };

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
      {isValidRange(selectedRange) && (
        <div
          className={styles.selectionOverlay}
          style={{
            left: `${gridRef.current?.api.getColumnElemWidthActualAtColIndex(
              selectedRange.startCol
            )}px`,
            top: `${gridRef.current?.api.getRowElemHeightActualAtRowIndex(
              selectedRange.startRow
            )}px`,
            width: `${
              gridRef.current?.api.getColumnElemWidthActualAtColIndex(
                selectedRange.endCol
              ) -
              gridRef.current?.api.getColumnElemWidthActualAtColIndex(
                selectedRange.startCol
              ) +
              gridRef.current?.api.getColumnElemWidthActualAtColIndex(0)
            }px`,
            height: `${
              gridRef.current?.api.getRowElemHeightActualAtRowIndex(
                selectedRange.endRow
              ) -
              gridRef.current?.api.getRowElemHeightActualAtRowIndex(
                selectedRange.startRow
              ) +
              gridRef.current?.api.getRowElemHeightActualAtRowIndex(0)
            }px`
          }}
        />
      )}
    </div>
  );
};

export default RangeSelection;
