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
  FaSort,
  FaSortAlphaDown,
  FaSortAlphaUp,
  FaSortNumericDown,
  FaSortNumericUp
} from 'react-icons/fa';
import { getContextMenuItems } from '@/ui/nodes/tableNode/utils/headerContextMenuItems';
import RenameColumnModal from '@/ui/nodes/tableNode/components/RenameColumnModal';
import { GridApi, ColumnState, ColDef } from 'ag-grid-community';

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

  const changeColumnType = (
    params: { column: ColumnState; api: GridApi },
    content: { columns: ColDef[]; rows: any[] },
    setContent: (content: { columns: ColDef[]; rows: any[] }) => void,
    newType: string,
    gridRef: React.RefObject<any>
  ) => {
    const updatedColumns = content.columns.map((col) => {
      if ('field' in col && col.field === params.column.colId) {
        return { ...col, type: newType };
      }
      return col;
    });
    setContent({ ...content, columns: updatedColumns });
    gridRef.current.api.refreshHeader();
  };

  const updateColumnAlignment = (
    api: GridApi,
    colId: string,
    alignment: string
  ) => {
    const columnDefs = api.getColumnDefs();
    if (columnDefs) {
      const updatedColumnDefs = columnDefs.map((colDef) => {
        if ('field' in colDef && colDef.field === colId) {
          return {
            ...colDef,
            cellStyle: { textAlign: alignment }
          };
        }
        return colDef;
      });
      api.updateGridOptions({ columnDefs: updatedColumnDefs });
      api.refreshCells({ force: true });
    }
  };

  return (
    <Portal>
      <Menu id={id} className={styles.contextMenu}>
        <Item onClick={() => handleSort('asc')}>
          <FaSortAlphaUp /> Sort Ascending
        </Item>
        <Item onClick={() => handleSort('desc')}>
          <FaSortAlphaDown /> Sort Descending
        </Item>
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
        <Submenu label="Change Datatype">
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
    </Portal>
  );
};

export default HeaderContextMenu;
