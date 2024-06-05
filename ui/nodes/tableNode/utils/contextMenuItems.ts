import { Papa } from 'papaparse';
import { addColumn } from '@/ui/nodes/tableNode/utils/TableFunctions';

export const getContextMenuItems = (
  params,
  content,
  setContent,
  updateNode
) => {
  const result = [
    'copy',
    'copyWithHeaders',
    'paste',
    'separator',
    {
      name: 'Sort Ascending',
      action: () =>
        params.columnApi.applyColumnState({
          state: [{ colId: params.column.getId(), sort: 'asc' }],
          applyOrder: true
        })
    },
    {
      name: 'Sort Descending',
      action: () =>
        params.columnApi.applyColumnState({
          state: [{ colId: params.column.getId(), sort: 'desc' }],
          applyOrder: true
        })
    },
    'separator',
    {
      name: 'Align Left',
      action: () =>
        params.columnApi.getColumnState().forEach((col) => {
          if (col.colId === params.column.getId()) {
            col.cellClass = 'ag-cell-left';
          }
        })
    },
    {
      name: 'Align Center',
      action: () =>
        params.columnApi.getColumnState().forEach((col) => {
          if (col.colId === params.column.getId()) {
            col.cellClass = 'ag-cell-center';
          }
        })
    },
    {
      name: 'Align Right',
      action: () =>
        params.columnApi.getColumnState().forEach((col) => {
          if (col.colId === params.column.getId()) {
            col.cellClass = 'ag-cell-right';
          }
        })
    },
    'separator',
    {
      name: 'Add Column',
      action: () => addColumn(content, setContent, params.api)
    },
    {
      name: 'Delete Column',
      action: () => {
        const updatedColumns = content.columns.filter(
          (col) => col.field !== params.column.getId()
        );
        setContent({ ...content, columns: updatedColumns });
      }
    },
    'separator',
    {
      name: 'Export Column Data',
      action: () => {
        const columnData = content.rows.map(
          (row) => row[params.column.getId()]
        );
        const csvContent =
          'data:text/csv;charset=utf-8,' + columnData.join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `${params.column.getId()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    },
    {
      name: 'Import Column Data',
      action: () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const csvData = event.target?.result as string;
              const parsedData = Papa.parse(csvData, { header: false }).data;
              const updatedRows = content.rows.map((row, index) => ({
                ...row,
                [params.column.getId()]: parsedData[index][0]
              }));
              setContent({ ...content, rows: updatedRows });
            };
            reader.readAsText(file);
          }
        };
        input.click();
      }
    }
  ];
  return result;
};
