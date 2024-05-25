import { useStore } from '@/app/store/useCanvasStore';
import Papa from 'papaparse';

export const validateCellValue = (value: any, type: string): boolean => {
  switch (type) {
    case 'text':
      return typeof value === 'string';
    case 'number':
      return !isNaN(value);
    case 'date':
      return !isNaN(Date.parse(value));
    case 'boolean':
      return value === 'true' || value === 'false';
    case 'currency':
      return !isNaN(parseFloat(value)) && isFinite(value);
    default:
      return true;
  }
};

const onCellValueChanged = (event, setContent) => {
  const { colDef, newValue, oldValue, data } = event;
  const columnType = colDef.type;

  if (!validateCellValue(newValue, columnType)) {
    alert(`Invalid value for column type ${columnType}`);
    event.node.setDataValue(colDef.field, oldValue);
    return;
  }

  setContent((prevContent) => {
    const rowIndex = event.rowIndex;
    const colId = colDef.field;
    if (colId !== undefined && rowIndex !== null) {
      const newRows = [...prevContent.rows];
      newRows[rowIndex][colId] = newValue;
      return {
        ...prevContent,
        rows: newRows
      };
    }
    return prevContent;
  });
};

export const addColumn = (content: any, setContent: (content: any) => void) => {
  console.log('TableFunctions: Adding column');
  setContent((prevContent: any) => {
    const newColumn = {
      headerName: 'New Column',
      field: `col${prevContent.columns.length + 1}`,
      editable: true
    };
    const newRows = prevContent.rows.map((row: any) => ({
      ...row,
      [newColumn.field]: ''
    }));
    return {
      ...prevContent,
      columns: [...prevContent.columns, newColumn],
      rows: newRows
    };
  });
};

export const addRow = (content: any, setContent: (content: any) => void) => {
  console.log('TableFunctions: Adding row');
  setContent((prevContent: any) => {
    const newRow = prevContent.columns.reduce((row: any, col: any) => {
      row[col.field] = '';
      return row;
    }, {});
    return {
      ...prevContent,
      rows: [...prevContent.rows, newRow]
    };
  });
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
        editable: true
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

export const toggleBold = (
  content: any,
  setContent: (content: any) => void
) => {
  console.log('TableFunctions: Toggling bold');
  setContent((prevContent: any) => ({
    ...prevContent,
    isBold: !prevContent.isBold
  }));
};

export const toggleItalic = (
  content: any,
  setContent: (content: any) => void
) => {
  console.log('TableFunctions: Toggling italic');
  setContent((prevContent: any) => ({
    ...prevContent,
    isItalic: !prevContent.isItalic
  }));
};

export const toggleUnderline = (
  content: any,
  setContent: (content: any) => void
) => {
  console.log('TableFunctions: Toggling underline');
  setContent((prevContent: any) => ({
    ...prevContent,
    isUnderline: !prevContent.isUnderline
  }));
};

export const alignLeft = (content: any, setContent: (content: any) => void) => {
  console.log('TableFunctions: Aligning left');
  setContent((prevContent: any) => ({
    ...prevContent,
    columns: prevContent.columns.map((col: any) => ({
      ...col,
      cellStyle: { textAlign: 'left' }
    }))
  }));
};

export const alignCenter = (
  content: any,
  setContent: (content: any) => void
) => {
  console.log('TableFunctions: Aligning center');
  setContent((prevContent: any) => ({
    ...prevContent,
    columns: prevContent.columns.map((col: any) => ({
      ...col,
      cellStyle: { textAlign: 'center' }
    }))
  }));
};

export const alignRight = (
  content: any,
  setContent: (content: any) => void
) => {
  console.log('TableFunctions: Aligning right');
  setContent((prevContent: any) => ({
    ...prevContent,
    columns: prevContent.columns.map((col: any) => ({
      ...col,
      cellStyle: { textAlign: 'right' }
    }))
  }));
};

export const sortTable = (content: any, setContent: (content: any) => void) => {
  console.log('TableFunctions: Sorting table');
  setContent((prevContent: any) => {
    const sortedRows = [...prevContent.rows].sort((a, b) => {
      const firstColumn = prevContent.columns[0].field;
      if (a[firstColumn] < b[firstColumn]) return -1;
      if (a[firstColumn] > b[firstColumn]) return 1;
      return 0;
    });
    return {
      ...prevContent,
      rows: sortedRows
    };
  });
};

export const filterTable = (
  content: any,
  setContent: (content: any) => void,
  filterFn: (row: any) => boolean
) => {
  console.log('TableFunctions: Filtering table');
  setContent((prevContent: any) => {
    const filteredRows = prevContent.rows.filter(filterFn);
    return {
      ...prevContent,
      rows: filteredRows
    };
  });
};
