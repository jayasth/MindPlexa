import { useEffect } from 'react';
import { addRow, addColumn } from '@/ui/nodes/tableNode/utils/TableFunctions';

export const useKeyPressHandler = (
  content,
  setContent,
  updateNode,
  gridRef
) => {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'n') {
        addRow(content, setContent, updateNode);
      } else if (event.ctrlKey && event.key === 'm') {
        addColumn(content, setContent, updateNode);
      } else if (event.ctrlKey && event.key === 'd') {
        // Delete selected row
        const api = gridRef.current?.api;
        if (api) {
          const selectedRows = api.getSelectedRows();
          if (selectedRows.length > 0) {
            const updatedRows = content.rows.filter(
              (_, index) =>
                !selectedRows.some((row) => row.id === content.rows[index].id)
            );
            setContent({ ...content, rows: updatedRows });
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [content, setContent, updateNode, gridRef]);
};
