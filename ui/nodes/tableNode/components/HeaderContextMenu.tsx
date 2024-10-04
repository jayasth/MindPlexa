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
import {
  changeColumnType,
  updateColumnAlignment
} from '@/ui/nodes/tableNode/utils/headerContextMenuItems';
import RenameColumnModal from '@/ui/nodes/tableNode/components/RenameColumnModal';
import AddColumnModal from '@/ui/nodes/tableNode/components/AddColumnModal';

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

const HeaderContextMenu = ({ id, params, content, setContent, gridRef }) => {
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<Column | null>(null);
  const [addColumnPosition, setAddColumnPosition] = useState<
    'before' | 'after'
  >('before');

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

  const handleAddColumnSave = (newColumn) => {
    const columnIndex = content.columns.findIndex(
      (col) => col.field === params.column.colId
    );
    const newColumns = [...content.columns];
    if (addColumnPosition === 'before') {
      newColumns.splice(columnIndex, 0, newColumn);
    } else {
      newColumns.splice(columnIndex + 1, 0, newColumn);
    }
    setContent({ ...content, columns: newColumns });
    gridRef.current.api.refreshHeader();
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
        <Item onClick={() => handleSort('asc')}>Sort Ascending</Item>
        <Item onClick={() => handleSort('desc')}>Sort Descending</Item>
        <Separator />
        <Item
          onClick={() => {
            const column = params.column;
            if (!column) {
              return;
            }
            const colDef = content.columns.find(
              (col) => 'field' in col && col.field === column.colId
            );
            if (colDef) {
              setSelectedColumn({
                field: column.colId,
                headerName: colDef.headerName || '',
                type: Array.isArray(colDef.type)
                  ? colDef.type.join(', ')
                  : colDef.type || ''
              });
              setIsRenameModalOpen(true);
            }
          }}
        >
          Rename Column
        </Item>
        <Separator />
        <Submenu label="Change Datatype" style={{ minWidth: '120px' }}>
          <Item
            onClick={() =>
              changeColumnType(params, content, setContent, 'text', gridRef)
            }
          >
            {typeIcons['text']} Text
          </Item>
          <Item
            onClick={() =>
              changeColumnType(params, content, setContent, 'number', gridRef)
            }
          >
            {typeIcons['number']} Number
          </Item>
          <Item
            onClick={() =>
              changeColumnType(params, content, setContent, 'email', gridRef)
            }
          >
            {typeIcons['email']} Email
          </Item>
          <Item
            onClick={() =>
              changeColumnType(params, content, setContent, 'date', gridRef)
            }
          >
            {typeIcons['date']} Date
          </Item>
          <Item
            onClick={() =>
              changeColumnType(params, content, setContent, 'currency', gridRef)
            }
          >
            {typeIcons['currency']} Currency
          </Item>
        </Submenu>
        <Separator />
        <Submenu label="Add Column" style={{ minWidth: '120px' }}>
          <Item
            onClick={() => {
              setAddColumnPosition('before');
              setIsAddColumnModalOpen(true);
            }}
          >
            Add Column Before
          </Item>
          <Item
            onClick={() => {
              setAddColumnPosition('after');
              setIsAddColumnModalOpen(true);
            }}
          >
            Add Column After
          </Item>
        </Submenu>
        <Separator />
        <Submenu label="Alignment" style={{ minWidth: '120px' }}>
          <Item
            onClick={() =>
              updateColumnAlignment(params.api, params.column.colId, 'left')
            }
          >
            Align Left
          </Item>
          <Item
            onClick={() =>
              updateColumnAlignment(params.api, params.column.colId, 'center')
            }
          >
            Align Center
          </Item>
          <Item
            onClick={() =>
              updateColumnAlignment(params.api, params.column.colId, 'right')
            }
          >
            Align Right
          </Item>
        </Submenu>
        <Separator />
        <Item
          onClick={() => {
            const updatedColumns = content.columns.filter(
              (col) => col.field !== params.column.colId
            );
            setContent({ ...content, columns: updatedColumns });
          }}
        >
          Delete Column
        </Item>
      </Menu>
      {selectedColumn && (
        <RenameColumnModal
          isOpen={isRenameModalOpen}
          onClose={() => setIsRenameModalOpen(false)}
          column={selectedColumn}
          onSave={handleRenameSave}
        />
      )}
      {isAddColumnModalOpen && (
        <AddColumnModal
          isOpen={isAddColumnModalOpen}
          onClose={() => setIsAddColumnModalOpen(false)}
          onSave={handleAddColumnSave}
          existingColumns={content.columns}
        />
      )}
    </Portal>
  );
};

export default HeaderContextMenu;
