import { useStore } from '@/app/store/useCanvasStore';
import Papa from 'papaparse';

export const validateCellValue = (value: any, type: string): boolean => {
  switch (type) {
    case 'text':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number' && !isNaN(value);
    case 'date':
      return !isNaN(Date.parse(value));
    case 'boolean':
      return (
        typeof value === 'boolean' || value === 'true' || value === 'false'
      );
    case 'currency':
      return !isNaN(parseFloat(value)) && isFinite(value);
    default:
      return false; // Default to false to prevent accepting unknown types
  }
};

export const onCellValueChanged = (rowIdx, column, newValue, setContent) => {
  const columnType = column.type;

  if (!validateCellValue(newValue, columnType)) {
    alert(`Invalid value for column type ${columnType}`);
    return;
  }

  setContent((prevContent) => {
    const newRows = [...prevContent.rows];
    newRows[rowIdx][column.key] = newValue;
    return {
      ...prevContent,
      rows: newRows
    };
  });
};

export const addColumn = (content, setContent) => {
  const newColumn = {
    key: `col${content.columns.length + 1}`,
    name: `Column ${content.columns.length + 1}`,
    resizable: true,
    width: 150,
    editable: true,
    type: 'text' // Default type for new columns
  };
  setContent({
    ...content,
    columns: [...content.columns, newColumn]
  });
};

export const addRow = (content, setContent) => {
  const newRow = content.columns.reduce((row, col) => {
    row[col.key] = col.type === 'number' ? 0 : ''; // Default values based on type
    return row;
  }, {});
  setContent({
    ...content,
    rows: [...content.rows, newRow]
  });
};

export const importTableData = (event, setContent) => {
  const fileReader = new FileReader();
  fileReader.onload = (e) => {
    if (e.target && e.target.result) {
      const importedData = Papa.parse(e.target.result, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true
      }).data;
      const columns = Object.keys(importedData[0]).map((key) => ({
        key,
        name: key,
        resizable: true,
        editable: true,
        type: typeof importedData[0][key] // Infer type from first row data
      }));
      setContent({ columns, rows: importedData });
    }
  };
  if (event.target.files && event.target.files[0]) {
    fileReader.readAsText(event.target.files[0]);
  }
};

export const exportTableData = (content) => {
  const dataStr = Papa.unparse(content.rows);
  const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(dataStr);
  const exportFileDefaultName = 'tableData.csv';
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

export const handleKeyDown = (e) => {
  if (e.key === 'Enter') {
    const { rowIdx, idx } = e.target.dataset;
    const nextRowIdx = parseInt(rowIdx, 10) + 1;
    const cell = document.querySelector(
      `[data-row-idx="${nextRowIdx}"][data-idx="${idx}"]`
    );
    if (cell instanceof HTMLElement) {
      cell.focus();
    }
  }
};
