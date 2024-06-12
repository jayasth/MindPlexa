import Papa from 'papaparse';
import { CSSProperties } from 'react';
import { toast } from '@/ui/Toasts/use-toast';
import CustomHeader from '@/ui/nodes/tableNode/components/CustomHeader';
import { DateEditor } from '@/ui/nodes/tableNode/utils/CustomCellEditors';
import { GridOptions, ColDef } from 'ag-grid-community';
import CustomCellRenderer from '@/ui/nodes/tableNode/components/CustomCellRenderer';

/* Cell Operations */

export const validateCellValue = (value: any, type: string): boolean => {
  if (value === '') return true;

  switch (type) {
    case 'text':
      return typeof value === 'string';
    case 'number':
      return !isNaN(Number(value)) && isFinite(value);
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    case 'date':
      return !isNaN(Date.parse(value));
    case 'currency':
      return !isNaN(parseFloat(value)) && isFinite(value);
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

export const formatCellValue = (
  value: any,
  type: string,
  locale: string = 'en-US',
  currencyCode: string = 'USD'
): any => {
  switch (type) {
    case 'currency':
      return value
        ? new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currencyCode
          }).format(Number(value))
        : '';
    case 'date':
      return value
        ? new Intl.DateTimeFormat(locale).format(new Date(value))
        : '';
    case 'percentage':
      return `${Number(value).toFixed(2)}%`;
    default:
      return value;
  }
};

export const onCellValueChanged = (event, setContent) => {
  const oldValue = event.oldValue;
  let newValue = event.newValue;
  const columnType = event.colDef.type;
  const locale = event.colDef.locale || 'en-US';

  if (newValue === '') {
    event.node.data.invalid = false;
    event.api.refreshCells({
      rowNodes: [event.node],
      columns: [event.colDef.field]
    });
    setContent((prevContent) => {
      const updatedRows = prevContent.rows.map((row, index) => {
        if (index === event.rowIndex) {
          return { ...row, [event.colDef.field]: '' };
        }
        return row;
      });
      return { ...prevContent, rows: updatedRows };
    });
    return;
  }

  if (!validateCellValue(newValue, columnType)) {
    event.node.setDataValue(event.colDef.field, oldValue);
    event.node.data.invalid = true;
    event.api.refreshCells({
      rowNodes: [event.node],
      columns: [event.colDef.field]
    });

    toast({
      title: 'Invalid Input',
      description: `Invalid value for column type "${columnType}": ${newValue}`,
      variant: 'warning'
    });
  } else {
    const formattedValue = formatCellValue(newValue, columnType, locale, 'USD');

    setContent((prevContent) => {
      const updatedRows = prevContent.rows.map((row, index) => {
        if (index === event.rowIndex) {
          return { ...row, [event.colDef.field]: formattedValue };
        }
        return row;
      });
      return { ...prevContent, rows: updatedRows };
    });

    event.node.setDataValue(event.colDef.field, formattedValue);
    event.node.data.invalid = false;
    event.api.refreshCells({
      rowNodes: [event.node],
      columns: [event.colDef.field]
    });
  }
};
export const handleInvalidInput = (
  message: string,
  params: any,
  gridRef: React.RefObject<any>
) => {
  toast({
    title: 'Invalid Input',
    description: message,
    variant: 'warning'
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
      cellEditor: 'agDateCellEditor'
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
  }
  // rowSelection: 'multiple',
  // rowMultiSelectWithClick: true
};

export const getColumnDefs = (
  content,
  setContent,
  updateNode,
  gridRef
): ColDef[] => {
  return content.columns.map((col) => {
    return {
      ...col,
      type: col.type,
      headerName: col.headerName,
      field: col.field,
      editable: true,
      sortable: true,
      filter: true,
      filterParams: getFilterParams(col.type),
      cellEditor: getCellEditor(col.type),
      valueFormatter: getValueFormatter(col.type),
      headerComponent: CustomHeader,
      headerComponentParams: {
        menuIcon: 'fa-bars',
        context: { content, setContent, updateNode }
      },
      headerClass: 'custom-header-class',
      colId: col.field,
      cellRenderer: CustomCellRenderer,
      cellStyle: (params) => {
        const isValid = validateCellValue(params.value, col.type);
        const invalidCellStyle: CSSProperties = {
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          color: '#721c24'
        };
        const focusStyle: CSSProperties = {
          outline: '2px solid #7c3aed',
          outlineOffset: '-1px'
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

function getValueFormatter(type: string) {
  switch (type) {
    case 'currency':
      return (params) => (params.value ? `$${params.value}` : '');
    default:
      return null;
  }
}

export const addColumn = (
  content: any,
  setContent: (content: any) => void,
  api,
  columnType: string = 'text',
  locale: string = 'en-US'
) => {
  console.log('TableFunctions: Adding column');
  const newColumn = {
    headerName: 'New Column',
    field: `col${content.columns.length + 1}`,
    editable: true,
    type: columnType,
    locale // Store locale in column definition
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
  api,
  locale: string = 'en-US'
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
