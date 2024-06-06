import { DateEditor } from '@/ui/nodes/tableNode/utils/CustomCellEditors';
import { getContextMenuItems } from '@/ui/nodes/tableNode/utils/contextMenuItems';

export const getColumnDefs = (content, setContent, updateNode) => {
  return content.columns.map((col) => {
    let cellEditor: any = 'agTextCellEditor';
    let valueFormatter: ((params: any) => string) | null = null;

    switch (col.type) {
      case 'date':
        cellEditor = DateEditor;
        break;
      case 'currency':
        cellEditor = 'agTextCellEditor';
        valueFormatter = (params) => (params.value ? `$${params.value}` : '');
        break;
      default:
        cellEditor = 'agTextCellEditor';
    }

    return {
      ...col,
      headerName: col.headerName, // Use column header name from contextMenuItems
      type: col.type,
      sortable: false,
      filter: false,
      cellEditor,
      valueFormatter
    };
  });
};
