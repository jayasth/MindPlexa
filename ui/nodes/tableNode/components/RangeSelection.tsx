import React, { useState, useEffect, useRef } from 'react';
import styles from '@/ui/nodes/tableNode/styles/RangeSelection.module.css';

interface RangeSelectionProps {
  gridRef: React.RefObject<any>;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
}

interface RangeSelectionState {
  startRow: number | null;
  startCol: string | null;
  endRow: number | null;
  endCol: string | null;
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
  const dragStartRef = useRef<{ row: number; col: string } | null>(null);

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
        node.columnApi.getAllColumns().forEach((col) => {
          const colId = col.getId();
          if (
            newRange.startRow !== null &&
            newRange.endRow !== null &&
            newRange.startCol !== null &&
            newRange.endCol !== null
          ) {
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
          }
        });
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
            left: `${gridRef.current?.api.getColumnLeft(selectedRange.startCol)}px`,
            top: `${gridRef.current?.api.getRowTop(selectedRange.startRow)}px`,
            width: `${
              gridRef.current?.api.getColumnLeft(selectedRange.endCol) -
              gridRef.current?.api.getColumnLeft(selectedRange.startCol) +
              gridRef.current?.api.getColumnWidth(selectedRange.endCol)
            }px`,
            height: `${
              gridRef.current?.api.getRowTop(selectedRange.endRow) -
              gridRef.current?.api.getRowTop(selectedRange.startRow) +
              gridRef.current?.api.getRowHeight(selectedRange.endRow)
            }px`
          }}
        />
      )}
    </div>
  );
};

export default RangeSelection;
