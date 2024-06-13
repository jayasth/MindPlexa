import React from 'react';
import { Menu, Item, Separator } from 'react-contexify';
import 'react-contexify/ReactContexify.css';
import styles from '@/ui/nodes/tableNode/styles/CellContextMenu.module.css';
import Portal from '@/ui/nodes/tableNode/Portal';

interface CellContextMenuProps {
  id: string;
  position: { x: number; y: number };
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
  console.log('CellContextMenu: position', position);
  console.log('CellContextMenu: params', params);

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
    const updatedRows = content.rows.filter((row) => row !== params.node.data);
    setContent({ ...content, rows: updatedRows });
    gridRef.current.api.refreshCells({ force: true });
    onClose();
  };

  return (
    <Portal>
      <Menu
        id={id}
        className={styles.contextMenu}
        style={{ top: position.y, left: position.x }}
      >
        <Item onClick={handleCopy}>Copy</Item>
        <Item onClick={handlePaste}>Paste</Item>
        <Separator />
        <Item onClick={handleDeleteRow}>Delete Row</Item>
      </Menu>
    </Portal>
  );
};

export default CellContextMenu;
