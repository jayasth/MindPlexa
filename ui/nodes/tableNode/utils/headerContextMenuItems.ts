import { DateEditor } from '@/ui/nodes/tableNode/utils/CustomCellEditors';
import CustomHeader from '@/ui/nodes/tableNode/components/CustomHeader';

interface ContextMenuItem {
  name: string;
  action?: () => void;
  subMenu?: ContextMenuItem[];
}

const changeColumnType = (params, content, setContent, newType, gridRef) => {
  const updatedColumns = content.columns.map((col) => {
    if (col.field === params.column.getId()) {
      return { ...col, type: newType };
    }
    return col;
  });
  setContent({ ...content, columns: updatedColumns });
  gridRef.current.api.refreshHeader();
};

export const getContextMenuItems = (
  params,
  content,
  setContent,
  updateNode,
  gridRef
): (string | ContextMenuItem)[] => {
  const result: (string | ContextMenuItem)[] = [
    {
      name: 'Sort Ascending',
      action: () =>
        params.columnApi.applyColumnState({
          state: [{ colId: params.column.getId(), sort: 'asc' }],
          applyOrder: true
        })
    },
    {
      name: 'Sort Descending',
      action: () =>
        params.columnApi.applyColumnState({
          state: [{ colId: params.column.getId(), sort: 'desc' }],
          applyOrder: true
        })
    },
    {
      name: 'Filter',
      action: () => {
        gridRef.current.api.setFilterModel({
          [params.column.getId()]: null
        });
      }
    },
    {
      name: 'Rename Column',
      action: () => {
        const columnDef = params.column?.colDef;
        if (!columnDef) {
          console.error('Column definition is not available');
          return;
        }
        const newName = prompt('Enter new column name:', columnDef.headerName);
        if (newName) {
          const updatedColumns = content.columns.map((col) => {
            if (col.field === params.column.getId()) {
              return { ...col, headerName: newName };
            }
            return col;
          });
          setContent({ ...content, columns: updatedColumns });
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
        params.columnApi.getColumnState().forEach((col) => {
          if (col.colId === params.column.getId()) {
            col.cellClass = 'ag-cell-left';
          }
        });
        params.api.refreshCells({ force: true });
      }
    },
    {
      name: 'Align Center',
      action: () => {
        params.columnApi.getColumnState().forEach((col) => {
          if (col.colId === params.column.getId()) {
            col.cellClass = 'ag-cell-center';
          }
        });
        params.api.refreshCells({ force: true });
      }
    },
    {
      name: 'Align Right',
      action: () => {
        params.columnApi.getColumnState().forEach((col) => {
          if (col.colId === params.column.getId()) {
            col.cellClass = 'ag-cell-right';
          }
        });
        params.api.refreshCells({ force: true });
      }
    },
    {
      name: 'Delete Column',
      action: () => {
        const updatedColumns = content.columns.filter(
          (col) => col.field !== params.column.getId()
        );
        setContent({ ...content, columns: updatedColumns });
      }
    }
  ];
  return result;
};
