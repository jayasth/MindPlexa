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
import { getContextMenuItems } from '@/ui/nodes/tableNode/utils/headerContextMenuItems';

const typeIcons = {
  text: <MdOutlineTextFields />,
  number: <AiOutlineFieldNumber />,
  email: <MdAlternateEmail />,
  date: <MdOutlineDateRange />,
  currency: <MdAttachMoney />
};

const HeaderContextMenu = ({
  id,
  params,
  content,
  setContent,
  updateNode,
  gridRef
}) => {
  const contextMenuItems = getContextMenuItems(
    params,
    content,
    setContent,
    updateNode,
    gridRef
  );

  return (
    <Portal>
      <Menu id={id} className={styles.contextMenu}>
        {contextMenuItems.map((item, index) => {
          if (typeof item === 'string') {
            return <Separator key={index} />;
          } else if (item.subMenu) {
            return (
              <Submenu
                key={item.name}
                label={item.name}
                style={{ minWidth: '120px' }}
              >
                {item.subMenu.map((subItem) => (
                  <Item key={subItem.name} onClick={subItem.action}>
                    {typeIcons[subItem.name.toLowerCase()]}{' '}
                    <span style={{ marginLeft: '8px' }}>{subItem.name}</span>
                  </Item>
                ))}
              </Submenu>
            );
          } else {
            return (
              <Item key={item.name} onClick={item.action}>
                {item.name}
              </Item>
            );
          }
        })}
      </Menu>
    </Portal>
  );
};

export default HeaderContextMenu;
