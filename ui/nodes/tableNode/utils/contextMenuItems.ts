import { Papa } from 'papaparse';
import { DateEditor } from '@/ui/nodes/tableNode/utils/CustomCellEditors';
import { addColumn } from '@/ui/nodes/tableNode/utils/TableFunctions';
import CustomHeader from '@/ui/nodes/tableNode/components/CustomHeader';

interface ContextMenuItem {
  name: string;
  action?: () => void;
  subMenu?: ContextMenuItem[];
}

export const getContextMenuItems = (
  params,
  content,
  setContent,
  updateNode
): (string | { name: string; action?: () => void; subMenu?: any[] })[] => {
  const result: (
    | string
    | { name: string; action?: () => void; subMenu?: any[] }
  )[] = [
    'copy',
    'copyWithHeaders',
    'paste',
    'separator',
    {
      name: 'Rename Column',
      action: () => {
        const newName = prompt(
          'Enter new column name:',
          params.column.colDef.headerName
        );
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
      name: 'Change Column Type',
      subMenu: [
        {
          name: 'Aa',
          action: () => changeColumnType(params, content, setContent, 'text')
        },
        {
          name: '123',
          action: () => changeColumnType(params, content, setContent, 'number')
        },
        {
          name: '📩',
          action: () => changeColumnType(params, content, setContent, 'email')
        },
        {
          name: '📅',
          action: () => changeColumnType(params, content, setContent, 'date')
        },
        {
          name: '$',
          action: () =>
            changeColumnType(params, content, setContent, 'currency')
        }
      ]
    },
    'separator',
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
    'separator',
    {
      name: 'Align Left',
      action: () =>
        params.columnApi.getColumnState().forEach((col) => {
          if (col.colId === params.column.getId()) {
            col.cellClass = 'ag-cell-left';
          }
        })
    },
    {
      name: 'Align Center',
      action: () =>
        params.columnApi.getColumnState().forEach((col) => {
          if (col.colId === params.column.getId()) {
            col.cellClass = 'ag-cell-center';
          }
        })
    },
    {
      name: 'Align Right',
      action: () =>
        params.columnApi.getColumnState().forEach((col) => {
          if (col.colId === params.column.getId()) {
            col.cellClass = 'ag-cell-right';
          }
        })
    },
    'separator',
    {
      name: 'Add Column',
      action: () => addColumn(content, setContent, params.api)
    },
    {
      name: 'Delete Column',
      action: () => {
        const updatedColumns = content.columns.filter(
          (col) => col.field !== params.column.getId()
        );
        setContent({ ...content, columns: updatedColumns });
      }
    },
    'separator',
    {
      name: 'Export Column Data',
      action: () => {
        const columnData = content.rows.map(
          (row) => row[params.column.getId()]
        );
        const csvContent =
          'data:text/csv;charset=utf-8,' + columnData.join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `${params.column.getId()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    },
    {
      name: 'Import Column Data',
      action: () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const csvData = event.target?.result as string;
              const parsedData = Papa.parse(csvData, { header: false }).data;
              const updatedRows = content.rows.map((row, index) => ({
                ...row,
                [params.column.getId()]: parsedData[index][0]
              }));
              setContent({ ...content, rows: updatedRows });
            };
            reader.readAsText(file);
          }
        };
        input.click();
      }
    }
  ];
  return result;
};

const changeColumnType = (params, content, setContent, newType) => {
  const updatedColumns = content.columns.map((col) => {
    if (col.field === params.column.getId()) {
      return { ...col, type: newType };
    }
    return col;
  });
  setContent({ ...content, columns: updatedColumns });
};

export const getColumnDefs = (content, setContent, updateNode) => {
  return content.columns.map((col) => {
    let cellEditor: any = 'agTextCellEditor';
    let valueFormatter: ((params: any) => string) | null = null;

    switch (col.type) {
      case 'date':
        cellEditor = DateEditor;
        break;
      case 'currency':
        cellEditor = 'agTextCellEditor';
        valueFormatter = (params) => (params.value ? `$${params.value}` : '');
        break;
      default:
        cellEditor = 'agTextCellEditor';
    }

    return {
      ...col,
      headerName: col.headerName,
      type: col.type,
      sortable: true,
      filter: true,
      cellEditor,
      valueFormatter,
      headerComponent: CustomHeader,
      headerComponentParams: {
        menuIcon: 'fa-bars',
        context: { content, setContent, updateNode }
      },
      headerClass: 'custom-header-class',
      colId: col.field,
      getContextMenuItems: (params) =>
        getContextMenuItems(params, content, setContent, updateNode)
    };
  });
};
