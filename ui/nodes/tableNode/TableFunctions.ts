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
    case 'dropdown':
      return (
        Array.isArray(value) && value.every((item) => typeof item === 'string')
      );
    default:
      return true;
  }
};

export const onCellValueChanged = (event, setContent) => {
  const { colDef, newValue, oldValue, data, api } = event;
  const columnType = colDef.type;

  if (!validateCellValue(newValue, columnType)) {
    const userConfirmed = window.confirm(
      `Invalid value for column type ${columnType}`
    );
    if (!userConfirmed) {
      api.undoCellEditing();
      return;
    }
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

export const addColumn = (
  content: any,
  setContent: (content: any) => void,
  api
) => {
  console.log('TableFunctions: Adding column');
  const newColumn = {
    headerName: 'New Column',
    field: `col${content.columns.length + 1}`,
    editable: true,
    type: 'text'
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
