import { getContrastYIQ } from '@/ui/canvasEditor/utils/CommonNodeFunctions';
import Papa from 'papaparse';
import { useStore } from '@/app/store/useCanvasStore';

export const handleBackgroundColorChange = (
  color,
  setTextColor,
  setBackgroundColor,
  dataId
) => {
  const rgbaColor = `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`;
  const newTextColor = getContrastYIQ(rgbaColor);
  setTextColor(newTextColor);
  setBackgroundColor(rgbaColor);
};

export const handleStrokeColorChange = (color, setCurrentColor) => {
  setCurrentColor(color.rgb);
};

export const handleStrokeWidthChange = (event, setThickness) => {
  setThickness(parseInt(event.target.value, 10));
};

export const undo = (stageRef) => {
  const { content, setContent } = useStore((state) => ({
    content: state.nodes.find((node) => node.id === stageRef.current.attrs.id)
      ?.data.content,
    setContent: (newContent) =>
      state.updateNode(stageRef.current.attrs.id, {
        data: { content: newContent }
      })
  }));

  if (content.length > 0) {
    const newContent = content.slice(0, -1);
    setContent(newContent);
  }
};

export const redo = (stageRef) => {
  // Redo functionality would require tracking the history of undos, which is not implemented in the current context.
  // This function is a placeholder to illustrate where redo logic would be implemented.
  console.warn('Redo functionality is not implemented yet.');
};

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
    alert(`Invalid value for column type ${columnType}`);
    api.undoCellEditing(); // Using AG Grid API to revert changes
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
    type: 'text' // Default type
  };
  setContent({
    ...content,
    columns: [...content.columns, newColumn]
  });
  api.refreshCells && api.refreshCells({ force: true }); // Refresh cells to reflect new column
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
  api.refreshCells && api.refreshCells({ force: true }); // Refresh cells to reflect new row
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
        type: 'text' // Default type
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
