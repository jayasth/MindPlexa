import { ColDef, ColumnState, GridApi } from 'ag-grid-community';

interface ContextMenuItem {
  name: string;
  action?: () => void;
  subMenu?: ContextMenuItem[];
}

export const changeColumnType = (
  params: { column: ColumnState; api: GridApi },
  content: { columns: ColDef[]; rows: any[] },
  setContent: (content: { columns: ColDef[]; rows: any[] }) => void,
  newType: string,
  gridRef: React.RefObject<any>
) => {
  const updatedColumns = content.columns.map((col) => {
    if (col.field === params.column.colId) {
      return { ...col, type: newType };
    }
    return col;
  });
  setContent({ ...content, columns: updatedColumns });
  gridRef.current.api.refreshHeader();
};

export const updateColumnAlignment = (api, colId, alignment) => {
  const columnDefs = api.getColumnDefs();
  const updatedColumnDefs = columnDefs.map((colDef) => {
    if (colDef.field === colId) {
      return {
        ...colDef,
        cellStyle: { textAlign: alignment }
      };
    }
    return colDef;
  });
  api.setColumnDefs(updatedColumnDefs);
  api.refreshCells({ force: true });
  api.refreshHeader();
};

export const getContextMenuItems = (
  params: {
    column: ColumnState;
    api: GridApi;
  },
  content: {
    columns: ColDef[];
    rows: any[];
  },
  setContent: (content: { columns: ColDef[]; rows: any[] }) => void,
  updateNode: (id: string, data: Partial<any>) => void,
  gridRef: React.RefObject<any>,
  setIsRenameModalOpen: (isOpen: boolean) => void,
  setSelectedColumn: (column: {
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
