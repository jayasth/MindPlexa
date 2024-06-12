import { CellPosition } from 'ag-grid-community';

interface SelectionRange {
  start: CellPosition | null;
  end: CellPosition | null;
}

export class RangeSelection {
  private selectionRange: SelectionRange = {
    start: null,
    end: null
  };

  public onCellMouseDown(params: any) {
    console.log('RangeSelection: onCellMouseDown called with params:', params);
    this.selectionRange.start = {
      rowIndex: params.node.rowIndex,
      rowPinned: params.node.rowPinned,
      column: params.column
    };
    console.log(
      'RangeSelection: selectionRange.start set to:',
      this.selectionRange.start
    );
  }

  public onCellMouseOver(params: any) {
    console.log('RangeSelection: onCellMouseOver called with params:', params);
    if (this.selectionRange.start) {
      this.selectionRange.end = {
        rowIndex: params.node.rowIndex,
        rowPinned: params.node.rowPinned,
        column: params.column
      };
      console.log(
        'RangeSelection: selectionRange.end set to:',
        this.selectionRange.end
      );
      this.updateSelectedCells(params.api);
    }
  }

  public onCellMouseUp() {
    console.log('RangeSelection: onCellMouseUp called');
    this.selectionRange = {
      start: null,
      end: null
    };
    console.log('RangeSelection: selectionRange reset to null');
  }

  private updateSelectedCells(api: any) {
    console.log('RangeSelection: updateSelectedCells called with api:', api);
    const { start, end } = this.selectionRange;
    if (start && end) {
      const startRow = Math.min(start.rowIndex, end.rowIndex);
      const endRow = Math.max(start.rowIndex, end.rowIndex);
      const startCol = Math.min(
        start.column.getInstanceId(),
        end.column.getInstanceId()
      );
      const endCol = Math.max(
        start.column.getInstanceId(),
        end.column.getInstanceId()
      );

      console.log(
        'RangeSelection: Calculated range - startRow:',
        startRow,
        'endRow:',
        endRow,
        'startCol:',
        startCol,
        'endCol:',
        endCol
      );

      const selectedCells: CellPosition[] = [];
      for (let rowIndex = startRow; rowIndex <= endRow; rowIndex++) {
        for (let colIndex = startCol; colIndex <= endCol; colIndex++) {
          selectedCells.push({
            rowIndex,
            rowPinned: null,
            column: api.getAllColumns()[colIndex]
          });
        }
      }

      console.log(
        'RangeSelection: selectedCells array populated with:',
        selectedCells
      );

      api.clearRangeSelection();
      api.addCellRange({
        rowStartIndex: startRow,
        rowEndIndex: endRow,
        columnStart: api.getAllColumns()[startCol],
        columnEnd: api.getAllColumns()[endCol]
      });

      console.log('RangeSelection: Range selection updated in the grid');
    }
  }
}
