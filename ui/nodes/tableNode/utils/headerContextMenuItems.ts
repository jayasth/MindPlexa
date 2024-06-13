// headerContextMenuItems.ts
import { ColDef, ColumnState, GridApi } from 'ag-grid-community';

interface ContextMenuItem {
  name: string;
  action?: () => void;
  subMenu?: ContextMenuItem[];
}

const changeColumnType = (
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
    console.error('Invalid params provided to context menu items.');
    return [];
  }

  const result: (string | ContextMenuItem)[] = [
    {
      name: 'Sort Ascending',
      action: () =>
        params.api.applyColumnState({
          state: [{ colId: params.column.colId, sort: 'asc' }],
          applyOrder: true
        })
    },
    {
      name: 'Sort Descending',
      action: () =>
        params.api.applyColumnState({
          state: [{ colId: params.column.colId, sort: 'desc' }],
          applyOrder: true
        })
    },
    {
      name: 'Filter',
      action: () => {
        params.api.setFilterModel({
          [params.column.colId]: null
        });
      }
    },
    {
      name: 'Rename Column',
      action: () => {
        const column = params.column;
        if (!column) {
          console.error('Column is not available');
          return;
        }
        const colDef = content.columns.find(
          (col) => col.field === column.colId
        );
        if (colDef) {
          setSelectedColumn({
            field: column.colId,
            headerName: colDef.headerName || '',
            type: Array.isArray(colDef.type)
              ? colDef.type.join(', ')
              : colDef.type || ''
          });
          setIsRenameModalOpen(true);
        }
      }
    },
    {
      name: 'Change Datatype',
      subMenu: [
        {
          name: 'Text',
          action: () =>
            changeColumnType(params, content, setContent, 'text', gridRef)
        },
        {
          name: 'Number',
          action: () =>
            changeColumnType(params, content, setContent, 'number', gridRef)
        },
        {
          name: 'Email',
          action: () =>
            changeColumnType(params, content, setContent, 'email', gridRef)
        },
        {
          name: 'Date',
          action: () =>
            changeColumnType(params, content, setContent, 'date', gridRef)
        },
        {
          name: 'Currency',
          action: () =>
            changeColumnType(params, content, setContent, 'currency', gridRef)
        }
      ]
    },
    {
      name: 'Align Left',
      action: () => {
        const updatedColumns = content.columns.map((col) => {
          if (col.field === params.column.colId) {
            return { ...col, cellClass: 'ag-cell-left' };
          }
          return col;
        });
        setContent({ ...content, columns: updatedColumns });
        params.api.refreshCells({ force: true });
      }
    },
    {
      name: 'Align Center',
      action: () => {
        const updatedColumns = content.columns.map((col) => {
          if (col.field === params.column.colId) {
            return { ...col, cellClass: 'ag-cell-center' };
          }
          return col;
        });
        setContent({ ...content, columns: updatedColumns });
        params.api.refreshCells({ force: true });
      }
    },
    {
      name: 'Align Right',
      action: () => {
        const updatedColumns = content.columns.map((col) => {
          if (col.field === params.column.colId) {
            return { ...col, cellClass: 'ag-cell-right' };
          }
          return col;
        });
        setContent({ ...content, columns: updatedColumns });
        params.api.refreshCells({ force: true });
      }
    },
    {
      name: 'Delete Column',
      action: () => {
        const updatedColumns = content.columns.filter(
          (col) => col.field !== params.column.colId
        );
        setContent({ ...content, columns: updatedColumns });
      }
    }
  ];
  return result;
};
