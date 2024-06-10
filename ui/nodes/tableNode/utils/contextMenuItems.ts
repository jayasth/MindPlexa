import { Papa } from 'papaparse';
import { DateEditor } from '@/ui/nodes/tableNode/utils/CustomCellEditors';
import { addColumn } from '@/ui/nodes/tableNode/utils/TableFunctions';
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
    },
    {
      name: 'Clear Filter',
      action: () => {
        gridRef.current.api.setFilterModel({
          [params.column.getId()]: null
        });
      }
    },
    {
      name: 'Filter Column',
      action: () => {
        gridRef.current.api.setFilterModel({
          [params.column.getId()]: null
        });
      }
    }
  ];
  return result;
};

export const getColumnDefs = (content, setContent, updateNode, gridRef) => {
  return content.columns.map((col) => {
    let cellEditor: any = 'agTextCellEditor';
    let valueFormatter: ((params: any) => string) | null = null;
    let filterParams: any = null;

    switch (col.type) {
      case 'date':
        cellEditor = DateEditor;
        filterParams = {
          filterOptions: [
            'equals',
            'notEqual',
            'lessThan',
            'greaterThan',
            'inRange'
          ],
          comparator: (filterLocalDateAtMidnight, cellValue) => {
            const dateAsString = cellValue;
            if (dateAsString == null) return -1;
            const dateParts = dateAsString.split('-');
            const cellDate = new Date(
              Number(dateParts[0]),
              Number(dateParts[1]) - 1,
              Number(dateParts[2])
            );
            if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
              return 0;
            }
            if (cellDate < filterLocalDateAtMidnight) {
              return -1;
            }
            if (cellDate > filterLocalDateAtMidnight) {
              return 1;
            }
          }
        };
        break;
      case 'number':
        cellEditor = 'agTextCellEditor';
        filterParams = {
          filterOptions: [
            'equals',
            'notEqual',
            'lessThan',
            'greaterThan',
            'inRange'
          ]
        };
        break;
      case 'currency':
        cellEditor = 'agTextCellEditor';
        valueFormatter = (params) => (params.value ? `$${params.value}` : '');
        filterParams = {
          filterOptions: [
            'equals',
            'notEqual',
            'lessThan',
            'greaterThan',
            'inRange'
          ],
          comparator: (filterValue, cellValue) => {
            const filterValueNum = parseFloat(
              filterValue.replace(/[^0-9.-]+/g, '')
            );
            const cellValueNum = parseFloat(
              cellValue.replace(/[^0-9.-]+/g, '')
            );
            if (filterValueNum === cellValueNum) {
              return 0;
            }
            if (cellValueNum < filterValueNum) {
              return -1;
            }
            if (cellValueNum > filterValueNum) {
              return 1;
            }
          }
        };
        break;
      case 'email':
        cellEditor = 'agTextCellEditor';
        filterParams = {
          filterOptions: [
            'contains',
            'notContains',
            'equals',
            'notEqual',
            'startsWith',
            'endsWith'
          ]
        };
        break;
      default:
        cellEditor = 'agTextCellEditor';
        filterParams = {
          filterOptions: [
            'contains',
            'notContains',
            'equals',
            'notEqual',
            'startsWith',
            'endsWith'
          ]
        };
    }

    return {
      ...col,
      headerName: col.headerName,
      type: col.type,
      sortable: true,
      filter: true,
      filterParams,
      cellEditor,
      valueFormatter,
      headerComponent: CustomHeader,
      headerComponentParams: {
        menuIcon: 'fa-bars',
        context: { content, setContent, updateNode }
      },
      headerClass: 'custom-header-class',
      colId: col.field
    };
  });
};
