import CustomHeader from '@/ui/nodes/tableNode/components/CustomHeader';
import {
  DateEditor,
  DropdownEditor,
  BooleanEditor
} from '@/ui/nodes/tableNode/utils/CustomCellEditors';

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
      case 'dropdown':
        cellEditor = DropdownEditor;
        break;
      case 'boolean':
        cellEditor = BooleanEditor;
        break;
      default:
        cellEditor = 'agTextCellEditor';
    }

    return {
      ...col,
      headerComponent: CustomHeader,
      headerComponentParams: {
        content,
        setContent,
        updateNode
      },
      headerName: col.headerName,
      type: col.type,
      sortable: false,
      filter: false,
      cellEditor,
      valueFormatter
    };
  });
};
