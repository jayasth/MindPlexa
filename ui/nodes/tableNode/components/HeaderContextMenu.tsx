import React from 'react';
import { Menu, Item, Separator } from 'react-contexify';
import 'react-contexify/ReactContexify.css';
import styles from '@/ui/nodes/tableNode/styles/HeaderContextMenu.module.css';
import Portal from '@/ui/nodes/tableNode/Portal';

const HeaderContextMenu = ({
  id,
  onSortAsc,
  onSortDesc,
  onFilter,
  onRename,
  onChangeType,
  onDelete,
  onAlignLeft,
  onAlignCenter,
  onAlignRight
}) => {
  return (
    <Portal>
      <Menu id={id} className={styles.contextMenu}>
        <Item onClick={onSortAsc}>Sort Ascending</Item>
        <Item onClick={onSortDesc}>Sort Descending</Item>
        <Item onClick={onFilter}>Filter</Item>
        <Separator />
        <Item onClick={onRename}>Rename Column</Item>
        <Item onClick={onChangeType}>Change Datatype</Item>
        <Separator />
        <Item onClick={onAlignLeft}>Align Left</Item>
        <Item onClick={onAlignCenter}>Align Center</Item>
        <Item onClick={onAlignRight}>Align Right</Item>
        <Separator />
        <Item onClick={onDelete}>Delete Column</Item>
      </Menu>
    </Portal>
  );
};

export default HeaderContextMenu;
