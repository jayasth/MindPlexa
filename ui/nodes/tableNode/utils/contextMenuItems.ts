import { Papa } from 'papaparse';
import { DateEditor } from '@/ui/nodes/tableNode/utils/CustomCellEditors';
import { addColumn } from '@/ui/nodes/tableNode/utils/TableFunctions';
import CustomHeader from '@/ui/nodes/tableNode/components/CustomHeader';

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
