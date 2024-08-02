import Papa from 'papaparse';
import { CSSProperties } from 'react';
import { toast } from '@/ui/Toasts/use-toast';
import CustomHeader from '@/ui/nodes/tableNode/components/CustomHeader';
import { DateEditor } from '../components/DateEditor';
import { GridOptions, ColDef } from 'ag-grid-community';
import CustomCellRenderer from '@/ui/nodes/tableNode/components/CustomCellRenderer';
import CustomFloatingFilter from '@/ui/nodes/tableNode/components/CustomFloatingFilter';
import { format, isValid, parse, Locale } from 'date-fns';
import { enUS, fr, enGB, de, es, it, ja, ko, ru, zhCN } from 'date-fns/locale';

const locales: { [key: string]: Locale } = {
  'en-US': enUS,
  'en-GB': enGB,
  'fr-FR': fr,
  'de-DE': de,
  'es-ES': es,
  'it-IT': it,
  'ja-JP': ja,
  'ko-KR': ko,
  'ru-RU': ru,
  'zh-CN': zhCN
};

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
        const parsedDate = parse(value, 'yyyy-MM-dd', new Date());
        return isValid(parsedDate);
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

export const formatCellValue = (
  value: any,
  type: string,
  locale: string = 'en-US',
  dateFormat: string = 'yyyy-MM-dd'
): any => {
  switch (type) {
    case 'currency':
      return value
        ? new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: 'USD'
          }).format(parseFloat(value.replace(/[^0-9.-]+/g, '')))
        : '';
    case 'date':
      if (value) {
        const parsedDate = parse(value, 'yyyy-MM-dd', new Date());
        return isValid(parsedDate)
          ? format(parsedDate, dateFormat, { locale: locales[locale] || enUS })
          : '';
      }
      return '';
    case 'percentage':
      return `${Number(value).toFixed(2)}%`;
    default:
      return value;
  }
};

export const onCellValueChanged = (event, setContent) => {
  console.log('TableonCellValueChanged triggered');
  const oldValue = event.oldValue;
  let newValue = event.newValue;
  const columnType = event.colDef.type;
  const locale = event.colDef.locale || 'en-US';

  console.log('onCellValueChanged called with:', {
    oldValue,
    newValue,
    columnType
  });

  if (newValue === undefined || newValue === null) {
    newValue = '';
  }

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
    event.node.data.invalid = true;
    event.api.stopEditing();
    event.api.refreshCells({
      rowNodes: [event.node],
      columns: [event.colDef.field]
    });

    console.log(
      `TableFunctions: Invalid value for column type "${columnType}": ${newValue}`
    );
    toast({
      title: 'Invalid Input',
      description: `Invalid value for column type "${columnType}": ${newValue}`,
      variant: 'warning'
    });
  } else {
    let formattedValue = formatCellValue(newValue, columnType, locale);

    if (columnType === 'date') {
      const parsedDate = parse(newValue, 'yyyy-MM-dd', new Date());
      if (isValid(parsedDate)) {
        formattedValue = format(parsedDate, 'yyyy-MM-dd');
      } else {
        event.node.data.invalid = true;
        toast({
          title: 'Invalid Date',
          description: `The date "${newValue}" is not valid.`,
          variant: 'warning'
        });
        return;
      }
    }

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
          const cellDate = parse(cellValue, 'yyyy-MM-dd', new Date());
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
  locale = 'en-US',
  dateFormat = 'yyyy-MM-dd'
): ColDef[] => {
  return content.columns.map((col) => {
    const { locale: colLocale, ...restCol } = col;
    const baseColumnDef = {
      ...restCol,
      type: col.type,
      headerName: col.headerName,
      field: col.field,
      editable: true,
      sortable: true,
      floatingFilter: true,
      filterParams: getFilterParams(col.type),
      cellEditor: getCellEditor(col.type),
      valueFormatter: getValueFormatter(col.type, colLocale || locale),
      headerComponent: CustomHeader,
      headerComponentParams: {
        menuIcon: 'fa-bars',
        context: { content, setContent, updateNode }
      },
      headerClass: 'custom-header-class',
      colId: col.field,
      cellRenderer: CustomCellRenderer,
      floatingFilterComponent: CustomFloatingFilter,
      floatingFilterComponentParams: {
        suppressFilterButton: true
      },
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

    if (col.type === 'date') {
      return {
        ...baseColumnDef,
        cellEditor: DateEditor,
        cellEditorParams: { dateFormat },
        cellEditorPopup: true,
        cellRenderer: (params) => {
          return params.value
            ? format(
                parse(params.value, 'yyyy-MM-dd', new Date()),
                dateFormat,
                {
                  locale: locales[locale] || enUS
                }
              )
            : '';
        },
        filter: 'agDateColumnFilter',
        filterParams: {
          comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
            const cellDate = parse(cellValue, 'yyyy-MM-dd', new Date());
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

function getValueFormatter(type: string, locale: string) {
  switch (type) {
    case 'currency':
      return (params) =>
        params.value
          ? new Intl.NumberFormat(locale, {
              style: 'currency',
              currency: 'USD'
            }).format(parseFloat(params.value.replace(/[^0-9.-]+/g, '')))
          : '';
    case 'date':
      return (params) => {
        if (params.value) {
          const parsedDate = parse(params.value, 'yyyy-MM-dd', new Date());
          return isValid(parsedDate)
            ? format(parsedDate, 'PP', { locale: locales[locale] || enUS })
            : '';
        }
        return '';
      };
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
    locale
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
