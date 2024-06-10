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

export const handleCellClick = (event) => {
  console.log('Cell clicked', event);
  // Add any additional logic for single cell click
};

export const handleCellDoubleClick = (event) => {
  console.log('Cell double-clicked', event);
  // Add any additional logic for double cell click
};

// Function to handle right-click context menu
export const getContextMenuItems = (params) => {
  return [
    'copy',
    'cut',
    'paste',
    'separator',
    {
      name: 'Insert Row Above',
      action: () => {
        // Logic to insert row above
      }
    },
    {
      name: 'Insert Row Below',
      action: () => {
        // Logic to insert row below
      }
    },
    {
      name: 'Delete Row',
      action: () => {
        // Logic to delete row
      }
    },
    'separator',
    {
      name: 'Sort Ascending',
      action: () => {
        params.columnApi.applyColumnState({
          state: [{ colId: params.column.getId(), sort: 'asc' }],
          applyOrder: true
        });
      }
    },
    {
      name: 'Sort Descending',
      action: () => {
        params.columnApi.applyColumnState({
          state: [{ colId: params.column.getId(), sort: 'desc' }],
          applyOrder: true
        });
      }
    },
    'separator',
    {
      name: 'Filter',
      action: () => {
        // Logic to filter column
      }
    }
  ];
};

export const handleCellContextMenu = (
  event,
  params,
  setContextMenuPosition,
  setContextMenuParams,
  setIsContextMenuOpen
) => {
  event.preventDefault(); // Prevent the default context menu
  setContextMenuPosition({
    x: event.clientX,
    y: event.clientY
  });
  setContextMenuParams(params);
  setIsContextMenuOpen(true);
};
