import React, { useState, useEffect } from 'react';
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
import RenameColumnModal from '@/ui/nodes/tableNode/components/RenameColumnModal';

const typeIcons = {
  text: <MdOutlineTextFields />,
  number: <AiOutlineFieldNumber />,
  email: <MdAlternateEmail />,
  date: <MdOutlineDateRange />,
  currency: <MdAttachMoney />
};

interface Column {
  field: string;
  headerName: string;
  type: string;
}

const HeaderContextMenu = ({
  id,
  params,
  content,
  setContent,
  updateNode,
  gridRef
}) => {
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<Column | null>(null);

  useEffect(() => {
    if (!params || !params.column || !params.api) {
      console.error('HeaderContextMenu: Incomplete params provided.');
      return;
    }
    // Additional logic to handle params initialization
  }, [params]);

  if (!params || !params.column || !params.api) {
    return null;
  }

  const items = getContextMenuItems(
    params,
    content,
    setContent,
    updateNode,
    gridRef,
    setIsRenameModalOpen,
    setSelectedColumn
  );

  const handleRenameSave = (newName: string, newType: string) => {
    if (selectedColumn) {
      const updatedColumns = content.columns.map((col) => {
        if (col.field === selectedColumn.field) {
          return { ...col, headerName: newName, type: newType };
        }
        return col;
      });
      setContent({ ...content, columns: updatedColumns });
      gridRef.current.api.refreshHeader();
    }
  };

  const handleSort = (sort: 'asc' | 'desc') => {
    params.api.applyColumnState({
      state: [{ colId: params.column.colId, sort }],
      applyOrder: false
    });
    // Refresh the grid to ensure the correct order is displayed
    params.api.refreshCells({ force: true });
    params.api.refreshHeader();
  };

  return (
    <Portal>
      <Menu id={id} className={styles.contextMenu}>
        {items.map((item) => {
          if (typeof item === 'string') {
            return <Separator key={item} />;
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
              <Item
                key={item.name}
                onClick={
                  item.name === 'Sort Ascending'
                    ? () => handleSort('asc')
                    : item.name === 'Sort Descending'
                      ? () => handleSort('desc')
                      : item.action
                }
              >
                {item.name}
              </Item>
            );
          }
        })}
      </Menu>
      {selectedColumn && (
        <RenameColumnModal
          isOpen={isRenameModalOpen}
          onClose={() => setIsRenameModalOpen(false)}
          column={selectedColumn}
          onSave={handleRenameSave}
        />
      )}
    </Portal>
  );
};

export default HeaderContextMenu;
