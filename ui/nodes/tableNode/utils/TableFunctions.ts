import Papa from 'papaparse';
import { CSSProperties } from 'react';
import { toast } from '@/ui/Toasts/use-toast';
import CustomHeader from '@/ui/nodes/tableNode/components/CustomHeader';
import { DateEditor } from '../components/DateEditor';
import { GridOptions, ColDef } from 'ag-grid-community';
import CustomCellRenderer from '@/ui/nodes/tableNode/components/CustomCellRenderer';
import CustomFloatingFilter from '@/ui/nodes/tableNode/components/CustomFloatingFilter';
import { format, isValid, parse } from 'date-fns';

/* Cell Operations */

export const validateCellValue = (value: any, type: string): boolean => {
  if (value === '' || value == null) {
    return true;
  }
  switch (type) {
    case 'text':
      return typeof value === 'string';
    case 'number':
      return !isNaN(Number(value)) && isFinite(value);
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+.[^\s@]+$/;
      return emailRegex.test(value);
    case 'date':
      if (typeof value === 'string') {
        return validateDate(value);
      }
      return false;
    case 'currency':
      return (
        !isNaN(parseFloat(value.replace(/[^0-9.-]+/g, ''))) &&
        isFinite(parseFloat(value.replace(/[^0-9.-]+/g, '')))
      );
    case 'percentage':
      return (
        !isNaN(parseFloat(value)) &&
        isFinite(value) &&
        Number(value) >= 0 &&
        Number(value) <= 100
      );
    default:
      return true;
  }
};

const validateDate = (value: string): boolean => {
  const possibleFormats = [
    'yyyy-MM-dd',
    'dd/MM/yyyy',
    'MM/dd/yyyy',
    'dd.MM.yyyy',
    'yyyy/MM/dd'
  ];
  return possibleFormats.some((fmt) => isValid(parse(value, fmt, new Date())));
};

export const formatCellValue = (
  value: any,
  type: string,
  dateFormat: string = 'yyyy-MM-dd'
): any => {
  switch (type) {
    case 'currency':
      return value
        ? new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
          }).format(parseFloat(value.replace(/[^0-9.-]+/g, '')))
        : '';
    case 'date':
      if (value) {
        const parsedDate = parseDate(value);
        return parsedDate ? format(parsedDate, dateFormat) : '';
      }
      return '';
    case 'percentage':
      return value ? `${Number(value).toFixed(2)}%` : '';
    default:
      return value ?? '';
  }
};

const parseDate = (value: string | null): Date | null => {
  if (!value) return null;

  const possibleFormats = [
    'yyyy-MM-dd',
    'dd/MM/yyyy',
    'MM/dd/yyyy',
    'dd.MM.yyyy',
    'yyyy/MM/dd'
  ];
  for (const fmt of possibleFormats) {
    const parsedDate = parse(value, fmt, new Date());
    if (isValid(parsedDate)) {
      return parsedDate;
    }
  }
  return null;
};

export const onCellValueChanged = (
  event,
  setContent,
  nodeId,
  canvasId,
  updateNode,
  dateFormat
) => {
  console.log('TableonCellValueChanged triggered');
  const oldValue = event.oldValue;
  let newValue = event.newValue;
  const columnType = event.colDef.type;

  console.log('onCellValueChanged called with:', {
    oldValue,
    newValue,
    columnType
  });

  if (newValue === undefined || newValue === null) {
    newValue = '';
  }

  if (!validateCellValue(newValue, columnType)) {
    event.node.setDataValue(event.colDef.field, oldValue);
    console.log(
      `TableFunctions: Invalid value for column type "${columnType}": ${newValue}`
    );
    toast({
      title: 'Invalid Input',
      description: `Invalid value for column type "${columnType}": ${newValue}`,
      variant: 'warning'
    });
    // Prevent focus from moving to the next cell and keep editing mode
    setTimeout(() => {
      event.api.startEditingCell({
        rowIndex: event.rowIndex,
        colKey: event.column.getColId()
      });
    }, 0);
    return;
  }

  let formattedValue = formatCellValue(newValue, columnType, dateFormat);

  if (columnType === 'date') {
    if (newValue === '') {
      formattedValue = '';
    } else {
      const parsedDate = parseDate(newValue);
      if (parsedDate) {
        formattedValue = format(parsedDate, dateFormat);
      } else {
        event.node.setDataValue(event.colDef.field, '');
        toast({
          title: 'Invalid Date',
          description: `The date "${newValue}" is not valid. Please enter a valid date.`,
          variant: 'warning'
        });
        setTimeout(() => {
          event.api.startEditingCell({
            rowIndex: event.rowIndex,
            colKey: event.column.getColId()
          });
        }, 0);
        return;
      }
    }
  }

  setContent((prevContent) => {
    const newRows = prevContent.rows.map((row, index) =>
      index === event.rowIndex
        ? { ...row, [event.colDef.field]: formattedValue }
        : { ...row }
    );

    const newContent = {
      ...prevContent,
      rows: newRows
    };

    // Update the node with the new content
    updateNode(nodeId, canvasId, newContent);

    return newContent;
  });
};

/* Column Operations */

export const gridOptions: GridOptions = {
  columnTypes: {
    text: {
      filter: 'agTextColumnFilter',
      cellEditor: 'agTextCellEditor'
    },
    number: {
      filter: 'agNumberColumnFilter',
      cellEditor: 'agNumberCellEditor'
    },
    date: {
      filter: 'agDateColumnFilter',
      filterParams: {
        comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
          const cellDate = parseDate(cellValue);
          if (!cellDate) return 0;
          if (cellDate < filterLocalDateAtMidnight) {
            return -1;
          } else if (cellDate > filterLocalDateAtMidnight) {
            return 1;
          }
          return 0;
        }
      },
      cellEditor: DateEditor
    },
    currency: {
      filter: 'agNumberColumnFilter',
      cellEditor: 'agTextCellEditor',
      valueFormatter: (params) => (params.value ? `$${params.value}` : '')
    },
    email: {
      filter: 'agTextColumnFilter',
      cellEditor: 'agTextCellEditor'
    }
    // Add more column types as needed
  },
  defaultColDef: {
    filter: true,
    sortable: true,
    resizable: true
  },
  components: {
    dateEditor: DateEditor
  }
};

export const getColumnDefs = (
  content,
  setContent,
  updateNode,
  gridRef,
  dateFormat: string = 'yyyy-MM-dd'
): ColDef[] => {
  return content.columns.map((col) => {
    const { ...restCol } = col;
    const baseColumnDef: ColDef = {
      ...restCol,
      type: col.type,
      headerName: col.headerName,
      field: col.field,
      editable: true,
      sortable: true,
      floatingFilter: true,
      filterParams: getFilterParams(col.type),
      cellEditor: getCellEditor(col.type),
      valueFormatter: getValueFormatter(col.type, dateFormat),
      headerComponent: CustomHeader,
      headerComponentParams: {
        menuIcon: 'fa-bars',
        context: { content, setContent, updateNode }
      },
      headerClass: 'custom-header-class',
      colId: col.field,
      cellRenderer: CustomCellRenderer,
      floatingFilterComponent: CustomFloatingFilter,
      suppressFloatingFilterButton: true,
      cellStyle: (params) => {
        const isValid = validateCellValue(params.value, col.type);
        const invalidCellStyle: CSSProperties = {
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          color: '#721c24'
        };
        const focusStyle: CSSProperties = {
          // outline: '2px solid #7c3aed',
          // outlineOffset: '-1px'
        };
        const isFocused =
          params.api.getFocusedCell()?.rowIndex === params.rowIndex &&
          params.api.getFocusedCell()?.column.getId() === params.column.getId();
        return isValid || params.value === ''
          ? isFocused
            ? focusStyle
            : {}
          : { ...invalidCellStyle, ...(isFocused ? focusStyle : {}) };
      }
    };

    if (col.type === 'date') {
      return {
        ...baseColumnDef,
        cellEditor: 'dateEditor',
        cellEditorParams: { dateFormat },
        cellRenderer: (params) => {
          const parsedDate = parseDate(params.value);
          return parsedDate ? format(parsedDate, dateFormat) : params.value;
        },
        filter: 'agDateColumnFilter',
        filterParams: {
          comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
            const cellDate = parseDate(cellValue);
            if (!cellDate) return 0;
            if (cellDate < filterLocalDateAtMidnight) {
              return -1;
            } else if (cellDate > filterLocalDateAtMidnight) {
              return 1;
            }
            return 0;
          }
        }
      };
    }

    return baseColumnDef;
  });
};

function getFilterParams(type: string) {
  // Define filter parameters based on column type
  switch (type) {
    case 'date':
      return {
        filterOptions: [
          'equals',
          'notEqual',
          'lessThan',
          'greaterThan',
          'inRange'
        ],
        comparator: (filterLocalDateAtMidnight, cellValue) => {
          const cellDate = parseDate(cellValue);
          if (!cellDate) return 0;
          if (cellDate.getTime() === filterLocalDateAtMidnight.getTime()) {
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
    case 'number':
      return {
        filterOptions: [
          'equals',
          'notEqual',
          'lessThan',
          'greaterThan',
          'inRange'
        ]
      };
    case 'currency':
      return {
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
          const cellValueNum = parseFloat(cellValue.replace(/[^0-9.-]+/g, ''));
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
    case 'email':
      return {
        filterOptions: [
          'contains',
          'notContains',
          'equals',
          'notEqual',
          'startsWith',
          'endsWith'
        ]
      };
    default:
      return {
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
}

function getCellEditor(type: string) {
  switch (type) {
    case 'date':
      return DateEditor;
    default:
      return 'agTextCellEditor';
  }
}

function getValueFormatter(type: string, dateFormat: string) {
  switch (type) {
    case 'currency':
      return (params) =>
        params.value
          ? new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(parseFloat(params.value.replace(/[^0-9.-]+/g, '')))
          : '';
    case 'date':
      return (params) => {
        const parsedDate = parseDate(params.value);
        return parsedDate ? format(parsedDate, dateFormat) : '';
      };
    default:
      return null;
  }
}

export const addColumn = (
  content: any,
  setContent: (content: any) => void,
  api,
  columnType: string = 'text'
) => {
  console.log('TableFunctions: Adding column');
  const newColumn = {
    headerName: 'New Column',
    field: `col${content.columns.length + 1}`,
    editable: true,
    type: columnType
  };

  let newRows = content.rows;
  if (newRows.length === 0) {
    const newRow = { [newColumn.field]: '' };
    newRows = [newRow];
  } else {
    newRows = newRows.map((row) => ({ ...row, [newColumn.field]: '' }));
  }

  setContent({
    ...content,
    columns: [...content.columns, newColumn],
    rows: newRows
  });
  api.refreshCells && api.refreshCells({ force: true });
};

export const addRow = (
  content: any,
  setContent: (content: any) => void,
  api
) => {
  console.log('TableFunctions: Adding row');
  const newRow = content.columns.reduce((row: any, col: any) => {
    row[col.field] = '';
    return row;
  }, {});
  setContent({
    ...content,
    rows: [...content.rows, newRow]
  });
  api.refreshCells && api.refreshCells({ force: true });
};

/* File Operations */

export const importTableData = (
  event: React.ChangeEvent<HTMLInputElement>,
  setContent: (content: any) => void
) => {
  const fileReader = new FileReader();
  fileReader.onload = (e: ProgressEvent<FileReader>) => {
    if (e.target && e.target.result) {
      const importedData = Papa.parse(e.target.result as string, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true
      }).data;
      const columns = Object.keys(importedData[0]).map((key) => ({
        headerName: key,
        field: key,
        editable: true,
        type: 'text'
      }));
      setContent({ columns, rows: importedData });
    }
  };
  if (event.target.files && event.target.files[0]) {
    fileReader.readAsText(event.target.files[0]);
  }
};

export const exportTableData = (content: any) => {
  const dataStr = Papa.unparse(content.rows);
  const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(dataStr);
  const exportFileDefaultName = 'tableData.csv';
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};
