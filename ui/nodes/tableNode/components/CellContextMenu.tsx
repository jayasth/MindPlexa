import React, { useEffect, useCallback } from 'react';
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

  const handleCopy = () => {
    const selectedNodes = gridRef.current.api.getSelectedNodes();
    const selectedData = selectedNodes.map((node) => node.data);
    navigator.clipboard.writeText(JSON.stringify(selectedData));
    onClose();
  };

  const handlePaste = () => {
    navigator.clipboard.readText().then((text) => {
      const data = JSON.parse(text);
      const updatedRows = [...content.rows, ...data];
      setContent({ ...content, rows: updatedRows });
      gridRef.current.api.refreshCells({ force: true });
    });
    onClose();
  };

  const handleDeleteRow = () => {
    console.log('CellContextMenu: params:', params); // Add this line
    if (params && params.node && params.node.data) {
      const updatedRows = content.rows.filter(
        (row) => row !== params.node.data
      );
      setContent({ ...content, rows: updatedRows });
      gridRef.current.api.refreshCells({ force: true });
    } else {
      console.error(
        'CellContextMenu: params.node or params.node.data is undefined'
      );
    }
    onClose();
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
