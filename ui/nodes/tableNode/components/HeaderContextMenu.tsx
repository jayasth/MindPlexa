import React from 'react';
import { Menu, Item, Separator, Submenu } from 'react-contexify';
import 'react-contexify/ReactContexify.css';
import styles from '@/ui/nodes/tableNode/styles/HeaderContextMenu.module.css';
import Portal from '@/ui/nodes/tableNode/Portal';
import {
  MdOutlineTextFields,
  MdAlternateEmail,
  MdOutlineDateRange,
  MdAttachMoney
} from 'react-icons/md';
import { AiOutlineFieldNumber } from 'react-icons/ai';

const typeIcons = {
  text: <MdOutlineTextFields />,
  number: <AiOutlineFieldNumber />,
  email: <MdAlternateEmail />,
  date: <MdOutlineDateRange />,
  currency: <MdAttachMoney />
};

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
        <Submenu label="Change Datatype" className={styles.contextSubmenu}>
          {Object.entries(typeIcons).map(([type, icon]) => (
            <Item key={type} onClick={() => onChangeType(type)}>
              {icon} {type.charAt(0).toUpperCase() + type.slice(1)}
            </Item>
          ))}
        </Submenu>
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
