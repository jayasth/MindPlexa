import React from 'react';
import { Menu, Item, Separator, Submenu } from 'react-contexify';
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
  const itemStyle = {
    padding: '8px 16px',
    cursor: 'pointer'
  };

  return (
    <Portal>
      <Menu id={id} className={styles.contextMenu}>
        <Item onClick={onSortAsc} style={itemStyle} className={styles.item}>
          Sort Ascending
        </Item>
        <Item onClick={onSortDesc} style={itemStyle} className={styles.item}>
          Sort Descending
        </Item>
        <Item onClick={onFilter} style={itemStyle} className={styles.item}>
          Filter
        </Item>
        <Separator />
        <Item onClick={onRename} style={itemStyle} className={styles.item}>
          Rename Column
        </Item>
        <Submenu
          label="Change Datatype"
          style={{ minWidth: '100px' }} // Inline style for submenu width
        >
          <Item
            onClick={() => onChangeType('text')}
            style={itemStyle}
            className={styles.item}
          >
            Text
          </Item>
          <Item
            onClick={() => onChangeType('number')}
            style={itemStyle}
            className={styles.item}
          >
            Number
          </Item>
          <Item
            onClick={() => onChangeType('email')}
            style={itemStyle}
            className={styles.item}
          >
            Email
          </Item>
          <Item
            onClick={() => onChangeType('date')}
            style={itemStyle}
            className={styles.item}
          >
            Date
          </Item>
          <Item
            onClick={() => onChangeType('currency')}
            style={itemStyle}
            className={styles.item}
          >
            Currency
          </Item>
        </Submenu>
        <Separator />
        <Item onClick={onAlignLeft} style={itemStyle} className={styles.item}>
          Align Left
        </Item>
        <Item onClick={onAlignCenter} style={itemStyle} className={styles.item}>
          Align Center
        </Item>
        <Item onClick={onAlignRight} style={itemStyle} className={styles.item}>
          Align Right
        </Item>
        <Separator />
        <Item onClick={onDelete} style={itemStyle} className={styles.item}>
          Delete Column
        </Item>
      </Menu>
    </Portal>
  );
};

export default HeaderContextMenu;
