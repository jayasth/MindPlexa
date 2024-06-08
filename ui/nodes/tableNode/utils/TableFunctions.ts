import Papa from 'papaparse';
import { CSSProperties } from 'react';
import CustomHeader from '@/ui/nodes/tableNode/components/CustomHeader';

export const validateCellValue = (value: any, type: string): boolean => {
  switch (type) {
    case 'text':
      return typeof value === 'string' || value === '';
    case 'number':
      return (!isNaN(Number(value)) && isFinite(value)) || value === '';
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value) || value === '';
    case 'date':
      return !isNaN(Date.parse(value)) || value === '';
    case 'currency':
      return (!isNaN(parseFloat(value)) && isFinite(value)) || value === '';
    case 'percentage':
      return (
        (!isNaN(parseFloat(value)) &&
          isFinite(value) &&
          Number(value) >= 0 &&
          Number(value) <= 100) ||
        value === ''
      );
    default:
      return true;
  }
};

export const formatCellValue = (
  value: any,
  type: string,
  currencyCode: string = 'USD'
): any => {
  switch (type) {
    case 'currency':
      return value
        ? new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currencyCode
          }).format(Number(value))
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

  if (!validateCellValue(newValue, columnType)) {
    event.node.setDataValue(event.colDef.field, oldValue); // Revert to old value
    event.node.data.invalid = true; // Mark the row as invalid
    event.api.refreshCells({
      rowNodes: [event.node],
      columns: [event.colDef.field]
    });

    setTimeout(() => {
      alert(`Invalid value for column type "${columnType}": ${newValue}`);
    }, 0);
  } else {
    const formattedValue = formatCellValue(newValue, columnType);

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
    event.node.data.invalid = false; // Mark the row as valid
    event.api.refreshCells({
      rowNodes: [event.node],
      columns: [event.colDef.field]
    });
  }
};

export const getColumnDefs = (content, setContent, updateNode, gridRef) => {
  return content.columns.map((colDef) => ({
    ...colDef,
    filter: true,
    headerComponent: CustomHeader,
    headerComponentParams: {
      menuIcon: 'fa-bars',
      type: colDef.type
    },
    cellStyle: (params) => {
      const isValid = validateCellValue(params.value, colDef.type);
      const invalidCellStyle: CSSProperties = {
        backgroundColor: '#f8d7da',
        border: '1px solid #f5c6cb',
        color: '#721c24'
      };
      return isValid ? {} : invalidCellStyle;
    }
  }));
};

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
  setContent({
    ...content,
    columns: [...content.columns, newColumn]
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

export const handleKeyDown = (event, gridRef) => {
  const api = gridRef.current?.api;
  if (api) {
    if (
      [
        'ArrowUp',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        'Enter',
        'Tab'
      ].includes(event.key)
    ) {
      api.stopEditing(); // Commit editing before moving
    }
    switch (event.key) {
      case 'ArrowUp':
        api.tabToPreviousCell();
        break;
      case 'ArrowDown':
      case 'Enter':
        api.tabToNextCell();
        break;
      case 'ArrowLeft':
        api.tabToPreviousCell();
        break;
      case 'ArrowRight':
      case 'Tab':
        api.tabToNextCell();
        break;
      case 'Escape':
        api.stopEditing();
        break;
      default:
        break;
    }
  }
};

export const onCellKeyDown = (params) => {
  const key = params.event.key;
  if (
    key === 'Enter' ||
    key === 'Tab' ||
    key === 'ArrowRight' ||
    key === 'ArrowLeft' ||
    key === 'ArrowUp' ||
    key === 'ArrowDown'
  ) {
    params.api.stopEditing();
    switch (key) {
      case 'Enter':
      case 'ArrowDown':
        params.api.tabToNextCell();
        break;
      case 'Tab':
      case 'ArrowRight':
        params.api.tabToNextCell();
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        params.api.tabToPreviousCell();
        break;
    }
    params.event.preventDefault();
  }
};
