import React, { useEffect, useCallback } from 'react';
import { Menu, Item, Separator, useContextMenu } from 'react-contexify';
import 'react-contexify/ReactContexify.css';
import styles from '@/ui/nodes/tableNode/styles/CellContextMenu.module.css';
import Portal from '@/ui/nodes/tableNode/Portal';
import { MdContentCopy, MdContentPaste, MdDelete, MdAdd } from 'react-icons/md';

interface CellContextMenuProps {
  id: string;
  position: { x: number; y: number } | null;
  setContent: React.Dispatch<
    React.SetStateAction<{
      columns: Array<{ field: string }>;
      rows: Array<Record<string, string>>;
    }>
  >;
  content: {
    columns: Array<{ field: string }>;
    rows: Array<Record<string, string>>;
  };
  gridRef: React.MutableRefObject<{
    api: {
      getFocusedCell: () => {
        rowIndex: number;
        column: { colId: string };
      } | null;
      getRowNode: (index: number) => {
        data: Record<string, string>;
        setDataValue: (field: string, value: string) => void;
      };
      refreshCells: (params: { force: boolean }) => void;
      getSelectedRows: () => Array<Record<string, string>>;
    };
  }>;
}

const CellContextMenu: React.FC<CellContextMenuProps> = ({
  id,
  position,
  setContent,
  content,
  gridRef
}) => {
  const { show } = useContextMenu({
    id
  });

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
    const api = gridRef.current.api;
    const focusedCell = api.getFocusedCell();
    if (focusedCell) {
      const rowNode = api.getRowNode(focusedCell.rowIndex);
      const cellValue = rowNode.data[focusedCell.column.colId];
      try {
        await navigator.clipboard.writeText(cellValue);
      } catch (error) {
        console.error('Failed to copy data to clipboard:', error);
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
        rowNode.setDataValue(colId, clipboardText);
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

  const handleAddRowAbove = () => {
    const api = gridRef.current.api;
    const focusedCell = api.getFocusedCell();
    if (focusedCell) {
      const newRow = content.columns.reduce(
        (row: Record<string, string>, col: { field: string }) => {
          row[col.field] = '';
          return row;
        },
        {}
      );
      const updatedRows = [...content.rows];
      updatedRows.splice(focusedCell.rowIndex, 0, newRow);
      setContent({ ...content, rows: updatedRows });
    }
  };

  const handleAddRowBelow = () => {
    const api = gridRef.current.api;
    const focusedCell = api.getFocusedCell();
    if (focusedCell) {
      const newRow = content.columns.reduce(
        (row: Record<string, string>, col: { field: string }) => {
          row[col.field] = '';
          return row;
        },
        {}
      );
      const updatedRows = [...content.rows];
      updatedRows.splice(focusedCell.rowIndex + 1, 0, newRow);
      setContent({ ...content, rows: updatedRows });
    }
  };

  return (
    <Portal>
      <Menu id={id} className={styles.contextMenu}>
        <Item onClick={handleCopy}>
          <MdContentCopy /> Copy
        </Item>
        <Item onClick={handlePaste}>
          <MdContentPaste /> Paste
        </Item>
        <Separator />
        <Item onClick={handleAddRowAbove}>
          <MdAdd /> Add Row Above
        </Item>
        <Item onClick={handleAddRowBelow}>
          <MdAdd /> Add Row Below
        </Item>
        <Separator />
        <Item onClick={handleDeleteRow}>
          <MdDelete /> Delete Row
        </Item>
      </Menu>
    </Portal>
  );
};

export default CellContextMenu;
