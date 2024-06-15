import React, { useEffect, useCallback, useState } from 'react';
import { Menu, Item, Separator, useContextMenu } from 'react-contexify';
import 'react-contexify/ReactContexify.css';
import styles from '@/ui/nodes/tableNode/styles/CellContextMenu.module.css';
import Portal from '@/ui/nodes/tableNode/Portal';

interface CellContextMenuProps {
  id: string;
  position: { x: number; y: number } | null;
  params: any;
  onClose: () => void;
  setContent: React.Dispatch<React.SetStateAction<any>>;
  content: any;
  gridRef: React.MutableRefObject<any>;
}

const CellContextMenu: React.FC<CellContextMenuProps> = ({
  id,
  position,
  params,
  onClose,
  setContent,
  content,
  gridRef
}) => {
  const { show } = useContextMenu({
    id
  });

  const [isCopying, setIsCopying] = useState(false);

  const showContextMenu = useCallback(
    (event: MouseEvent) => {
      if (position) {
        show({ event });
      }
    },
    [show, position]
  );

  useEffect(() => {
    if (position) {
      const handleContextMenu = (event: MouseEvent) => {
        event.preventDefault();
        showContextMenu(event);
      };

      window.addEventListener('contextmenu', handleContextMenu);

      return () => {
        window.removeEventListener('contextmenu', handleContextMenu);
      };
    }
  }, [position, showContextMenu]);

  const handleCopy = async () => {
    setIsCopying(true);
    const api = gridRef.current.api;
    const selectedRows = api.getSelectedRows();
    if (selectedRows.length > 0) {
      const clipboardText = selectedRows
        .map((row) => Object.values(row).join('\t'))
        .join('\n');
      try {
        await navigator.clipboard.writeText(clipboardText);
        setIsCopying(false);
      } catch (error) {
        console.error('Failed to copy data to clipboard:', error);
        setIsCopying(false);
      }
    } else {
      const focusedCell = api.getFocusedCell();
      if (focusedCell) {
        const rowNode = api.getRowNode(focusedCell.rowIndex);
        const rowData = rowNode.data;
        const clipboardText = Object.values(rowData).join('\t');
        try {
          await navigator.clipboard.writeText(clipboardText);
          setIsCopying(false);
        } catch (error) {
          console.error('Failed to copy data to clipboard:', error);
          setIsCopying(false);
        }
      }
    }
  };

  const handlePaste = async () => {
    const api = gridRef.current.api;
    const focusedCell = api.getFocusedCell();
    if (focusedCell) {
      try {
        const clipboardText = await navigator.clipboard.readText();
        const rowNode = api.getRowNode(focusedCell.rowIndex);
        const colId = focusedCell.column.colId;
        const currentValue = rowNode.data[colId];
        const newValue = clipboardText; // Replace the current value with clipboard text
        rowNode.setDataValue(colId, newValue);
        api.refreshCells({ force: true });
      } catch (error) {
        console.error('Failed to paste data from clipboard:', error);
      }
    }
  };

  const handleDeleteRow = () => {
    const api = gridRef.current.api;
    const selectedRows = api.getSelectedRows();
    if (selectedRows.length > 0) {
      const updatedRows = content.rows.filter(
        (row) => !selectedRows.includes(row)
      );
      setContent({ ...content, rows: updatedRows });
    } else {
      const focusedCell = api.getFocusedCell();
      if (focusedCell) {
        const updatedRows = content.rows.filter(
          (row, index) => index !== focusedCell.rowIndex
        );
        setContent({ ...content, rows: updatedRows });
      }
    }
  };

  return (
    <Portal>
      <Menu id={id} className={styles.contextMenu}>
        <Item onClick={handleCopy}>Copy</Item>
        <Item onClick={handlePaste}>Paste</Item>
        <Separator />
        <Item onClick={handleDeleteRow}>Delete Row</Item>
      </Menu>
    </Portal>
  );
};

export default CellContextMenu;
