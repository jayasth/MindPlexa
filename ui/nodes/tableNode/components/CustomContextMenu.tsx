import React from 'react';
import { Menu, Item, useContextMenu, ItemParams } from 'react-contexify';
import 'react-contexify/ReactContexify.css';

const CustomContextMenu = ({ id, onRename, onChangeType, onDelete }) => {
  const { show } = useContextMenu({
    id
  });

  const handleContextMenu = (event) => {
    show({
      event,
      props: {
        key: 'value'
      }
    });
  };

  const handleItemClick = ({
    id,
    triggerEvent,
    event,
    props,
    data
  }: ItemParams<any, any>) => {
    switch (id) {
      case 'rename':
        onRename();
        break;
      case 'changeType':
        onChangeType();
        break;
      case 'delete':
        onDelete();
        break;
      default:
        break;
    }
  };

  return (
    <div onContextMenu={handleContextMenu}>
      <span className="context-menu-trigger" />
      <Menu id={id}>
        <Item id="rename" onClick={handleItemClick}>
          Rename Column
        </Item>
        <Item id="changeType" onClick={handleItemClick}>
          Change Column Type
        </Item>
        <Item id="delete" onClick={handleItemClick}>
          Delete Column
        </Item>
      </Menu>
    </div>
  );
};

export default CustomContextMenu;
