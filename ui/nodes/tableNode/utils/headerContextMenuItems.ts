import { ColDef, ColumnState, GridApi } from 'ag-grid-community';

interface ContextMenuItem {
  name: string;
  action?: () => void;
  subMenu?: ContextMenuItem[];
}

interface TableContent {
  columns: ColDef[];
  rows: Record<string, unknown>[];
}

export const changeColumnType = (
  params: { column: ColumnState; api: GridApi },
  content: TableContent,
  setContent: (content: TableContent) => void,
  newType: string,
  gridRef: React.RefObject<{ api: GridApi }>
) => {
  const updatedColumns = content.columns.map((col) => {
    if (col.field === params.column.colId) {
      return { ...col, type: newType };
    }
    return col;
  });
  setContent({ ...content, columns: updatedColumns });
  gridRef.current?.api.refreshHeader();
};

export const updateColumnAlignment = (
  api: GridApi,
  colId: string,
  alignment: string
) => {
  const columnDefs = api.getColumnDefs();
  if (columnDefs) {
    columnDefs.forEach((colDef) => {
      if ('field' in colDef && colDef.field === colId) {
        colDef.cellStyle = { textAlign: alignment };
      }
    });
    api.refreshCells({ force: true });
  }
};

export const getContextMenuItems = (
  params: {
    column: ColumnState;
    api: GridApi;
  },
  _content: TableContent,
  _setContent: (content: TableContent) => void,
  _updateNode: (id: string, data: Partial<Record<string, unknown>>) => void,
  _gridRef: React.RefObject<{ api: GridApi }>,
  _setIsRenameModalOpen: (isOpen: boolean) => void,
  _setSelectedColumn: (column: {
    field: string;
    headerName: string;
    type: string;
  }) => void
): (string | ContextMenuItem)[] => {
  if (!params || !params.column || !params.api) {
    console.error(
      'HeaderContextMenuItems: Invalid params provided to context menu items.'
    );
    return [];
  }

  const result: (string | ContextMenuItem)[] = [
    {
      name: 'Sort Ascending',
      action: () => {
        params.api.applyColumnState({
          state: [{ colId: params.column.colId, sort: 'asc' }],
          applyOrder: false // Ensure the column order is not changed
        });
        params.api.refreshCells({ force: true });
        params.api.refreshHeader();
      }
    },
    {
      name: 'Sort Descending',
      action: () => {
        params.api.applyColumnState({
          state: [{ colId: params.column.colId, sort: 'desc' }],
          applyOrder: false // Ensure the column order is not changed
        });
        params.api.refreshCells({ force: true });
        params.api.refreshHeader();
      }
    },
    'Rename Column',
    'Change Datatype',
    'Align Left',
    'Align Center',
    'Align Right',
    'Delete Column'
  ];
  return result;
};
