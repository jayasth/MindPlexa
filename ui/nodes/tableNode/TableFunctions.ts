import {
  GridColDef,
  GridRowsProp,
  GridCellParams,
  GridColumnHeaderParams
} from '@mui/x-data-grid';
import { useStore } from '@/app/store/useCanvasStore';
import Papa from 'papaparse';

export const addColumn = (content, setContent) => {
  const newColumn: GridColDef = {
    field: `col${content.columns.length + 1}`,
    headerName: `Column ${content.columns.length + 1}`,
    resizable: true,
    width: 150,
    editable: true,
    type: 'string',
    sortable: true,
    filterable: true
  };
  setContent({
    ...content,
    columns: [...content.columns, newColumn]
  });
};

export const handleTableDataChange = (
  nodeId: string,
  params: GridCellParams,
  setTableData: (data: GridRowsProp) => void
) => {
  const { updateNode } = useStore.getState();
  const newData = [...params.row];
  setTableData(newData);
  updateNode(nodeId, { data: { tableData: newData } });
};

export const handleTableActions = (
  nodeId: string,
  params: GridColDef,
  setTableColumns: (columns: GridColDef[]) => void
) => {
  const { updateNode } = useStore.getState();
  // Handle column actions here, e.g., sorting, filtering, etc.
  const newColumns = [params];
  setTableColumns(newColumns);
  updateNode(nodeId, { data: { tableColumns: newColumns } });
};
export const addRow = (content, setContent) => {
  const newRow = content.columns.reduce((row, col) => {
    row[col.field] = col.type === 'number' ? 0 : '';
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
        field: key,
        headerName: key,
        resizable: true,
        editable: true,
        type: typeof importedData[0][key],
        sortable: true,
        filterable: true
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
