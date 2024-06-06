import React from 'react';
import { Menu, Item, Separator } from 'react-contexify';
import 'react-contexify/ReactContexify.css';

const HeaderContextMenu = ({
  id,
  onSortAsc,
  onSortDesc,
  onFilter,
  onRename,
  onChangeType,
  onDelete
}) => {
  return (
    <Menu id={id}>
      <Item onClick={onSortAsc}>Sort Ascending</Item>
      <Item onClick={onSortDesc}>Sort Descending</Item>
      <Item onClick={onFilter}>Filter</Item>
      <Separator />
      <Item onClick={onRename}>Rename Column</Item>
      <Item onClick={onChangeType}>Change Column Type</Item>
      <Item onClick={onDelete}>Delete Column</Item>
    </Menu>
  );
};

export default HeaderContextMenu;
