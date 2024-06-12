import { useState, useCallback } from 'react';
import { CellStyle } from 'ag-grid-community';

type SelectionPoint = {
  rowIndex: number;
  colIndex: number;
} | null;

const useCellRangeSelection = (gridRef) => {
  const [selectionStart, setSelectionStart] = useState<SelectionPoint>(null);
  const [selectionEnd, setSelectionEnd] = useState<SelectionPoint>(null);
  const [isSelecting, setIsSelecting] = useState<boolean>(false);

  const onCellMouseDown = useCallback((params: any) => {
    if (params.node && params.column) {
      console.log(
        'KeyboardMouseHandler: onCellMouseDown - Cell mouse down detected'
      );
      setSelectionStart({
        rowIndex: params.node.rowIndex,
        colIndex: params.columnApi
          .getAllDisplayedColumns()
          .indexOf(params.column)
      });
      setIsSelecting(true);
      console.log(
        'KeyboardMouseHandler: onCellMouseDown - Selection started at',
        {
          rowIndex: params.node.rowIndex,
          colIndex: params.columnApi
            .getAllDisplayedColumns()
            .indexOf(params.column)
        }
      );
    }
  }, []);

  const onCellMouseMove = useCallback(
    (params: any) => {
      if (isSelecting && params.node && params.column) {
        console.log(
          'KeyboardMouseHandler: onCellMouseOver - Cell mouse over detected while selecting'
        );
        setSelectionEnd({
          rowIndex: params.node.rowIndex,
          colIndex: params.columnApi
            .getAllDisplayedColumns()
            .indexOf(params.column)
        });
        console.log(
          'KeyboardMouseHandler: onCellMouseOver - Selection end updated to',
          {
            rowIndex: params.node.rowIndex,
            colIndex: params.columnApi
              .getAllDisplayedColumns()
              .indexOf(params.column)
          }
        );
      }
    },
    [isSelecting]
  );

  const onCellMouseOut = useCallback(() => {
    if (isSelecting) {
      console.log(
        'KeyboardMouseHandler: onCellMouseOut - Cell mouse out detected, stopping selection'
      );
      setIsSelecting(false);
    }
  }, [isSelecting]);

  const getCellStyle = useCallback(
    (params: any): CellStyle => {
      let style: CellStyle = {};
      if (isCellInRange(params)) {
        style = { backgroundColor: '#c8dafc' };
        console.log(
          'KeyboardMouseHandler: getCellStyle - Cell is in range, applying style',
          style
        );
      }
      return style;
    },
    [selectionStart, selectionEnd]
  );

  const isCellInRange = useCallback(
    (params: any) => {
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
      const isInRange = inRowRange && inColRange;
      console.log(
        'KeyboardMouseHandler: isCellInRange - Checking if cell is in range',
        {
          params,
          selectionStart,
          selectionEnd,
          isInRange
        }
      );
      return isInRange;
    },
    [selectionStart, selectionEnd]
  );

  return { onCellMouseDown, onCellMouseMove, onCellMouseOut, getCellStyle };
};

export default useCellRangeSelection;
