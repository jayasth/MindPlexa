import { AgGridReact } from 'ag-grid-react';
import { Node } from 'reactflow';
import {
  getColumnDefs,
  gridOptions as existingOptions,
  onCellValueChanged,
  importTableData,
  exportTableData,
  addColumn,
  addRow
} from '@/ui/nodes/tableNode/utils/TableFunctions';
import CustomHeader from '@/ui/nodes/tableNode/components/CustomHeader';
import {
  useKeyPressHandler,
  onCellKeyDown
} from '@/ui/nodes/tableNode/utils/KeyboardMouseHandlers';
import {
  AddTableButton,
  AddColumnButton,
  AddRowButton,
  ExportButton,
  ImportButton,
  DeleteTableButton,
  SettingsButton
} from '@/ui/nodes/tableNode/components/TableNodeToolbar';
import AddTableModal from '@/ui/nodes/tableNode/components/AddTableModal';
import DeleteTableModal from '@/ui/nodes/tableNode/components/DeleteTableModal';
import SettingsModal from '@/ui/nodes/tableNode/components/SettingsModal';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import styles from '@/ui/nodes/tableNode/styles/TableNodeEdit.module.css';
import { useState, useCallback } from 'react';
import CellContextMenu from '@/ui/nodes/tableNode/components/CellContextMenu';
import HeaderContextMenu from '@/ui/nodes/tableNode/components/HeaderContextMenu';

interface TableNodeGridProps {
  content: { columns: any[]; rows: any[] };
  setContent: (content: { columns: any[]; rows: any[] }) => void;
  updateNode: (id: string, updates: Partial<Node>) => void;
  locale: string;
  gridRef: React.MutableRefObject<any>;
  onCellClick: (event: any) => void;
  handleCellContextMenu: (event: any) => void;
  handleCellContextMenuClose: () => void;
  cellContextMenuPosition: { x: number; y: number } | null;
  cellContextMenuParams: any;
  errorMessage: string;
  handleLocaleChange: (newLocale: string) => void;
  isDeleteModalOpen: boolean;
  setIsDeleteModalOpen: (isOpen: boolean) => void;
  isSettingsModalOpen: boolean;
  setIsSettingsModalOpen: (isOpen: boolean) => void;
  handleDeleteTable: () => void;
}

const TableNodeGrid: React.FC<TableNodeGridProps> = ({
  content,
  setContent,
  updateNode,
  locale,
  gridRef,
  onCellClick,
  handleCellContextMenu,
  handleCellContextMenuClose,
  cellContextMenuPosition,
  cellContextMenuParams,
  errorMessage,
  handleLocaleChange,
  isDeleteModalOpen,
  setIsDeleteModalOpen,
  isSettingsModalOpen,
  setIsSettingsModalOpen
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const updateColumnState = useCallback(() => {
    if (gridRef.current) {
      gridRef.current.api.refreshHeader();
    }
  }, [gridRef]);

  const handleDeleteTable = useCallback(() => {
    setContent({ columns: [], rows: [] });
    setIsDeleteModalOpen(false);
  }, [setContent]);

  const columnDefs = getColumnDefs(
    content,
    setContent,
    (id, updates) => updateNode(id, updates as Partial<Node>),
    gridRef
  );
  useKeyPressHandler(
    content,
    setContent,
    (id, updates) => updateNode(id, updates as Partial<Node>),
    gridRef
  );

  const gridOptions = {
    ...existingOptions,
    onCellClicked: onCellClick,
    onCellContextMenu: (event) => handleCellContextMenu(event)
  };

  return (
    <div>
      {errorMessage && (
        <div className={styles.errorMessage}>{errorMessage}</div>
      )}
      <div className={styles.toolbar}>
        <AddTableButton
          onClick={() => setIsModalOpen(true)}
          aria-label="Add Table"
        />
        <AddColumnButton
          onClick={(columnType) => {
            addColumn(
              content,
              setContent,
              (id, updates) => updateNode(id, updates as Partial<Node>),
              columnType,
              locale
            );
            updateColumnState();
          }}
          aria-label="Add Column"
          locale={locale}
        />
        <AddRowButton
          onClick={() =>
            addRow(content, setContent, (id, updates) =>
              updateNode(id, updates as Partial<Node>)
            )
          }
          aria-label="Add Row"
        />
        <ImportButton
          onChange={(e) => importTableData(e, setContent)}
          content={content}
          setContent={setContent}
          aria-label="Import Table"
        />
        <ExportButton
          onClick={() => exportTableData(content)}
          aria-label="Export Table"
        />
        <DeleteTableButton
          onClick={() => setIsDeleteModalOpen(true)}
          aria-label="Delete Table"
        />
        <SettingsButton onClick={() => setIsSettingsModalOpen(true)} />
      </div>

      <div
        className="ag-theme-alpine"
        style={{ height: '100%', width: '100%' }}
        role="grid"
        aria-label="Data Table"
      >
        <AgGridReact
          gridOptions={gridOptions}
          columnDefs={columnDefs as any}
          rowData={content.rows}
          domLayout="autoHeight"
          rowHeight={30}
          headerHeight={30}
          floatingFiltersHeight={30}
          defaultColDef={{
            resizable: true,
            editable: true,
            headerComponent: CustomHeader,
            headerComponentParams: { menuIcon: 'fa-bars' }
          }}
          onGridReady={(params) => {
            gridRef.current = params;
            params.api.sizeColumnsToFit();
          }}
          onCellValueChanged={(event) => onCellValueChanged(event, setContent)}
          onCellKeyDown={onCellKeyDown}
          ref={gridRef}
        />
      </div>

      {isModalOpen && (
        <AddTableModal
          onClose={() => setIsModalOpen(false)}
          onAddTable={(columns, rows) => {
            const newColumns = columns.map((col, index) => ({
              headerName: col.name || `Column ${index + 1}`,
              field: `col${index + 1}`,
              editable: true,
              type: col.type,
              defaultValue: col.defaultValue,
              locale
            }));

            const newRows = Array.from({ length: rows }, () =>
              newColumns.reduce((acc, col) => {
                acc[col.field] = col.defaultValue || '';
                return acc;
              }, {})
            );

            setContent({ columns: newColumns, rows: newRows });
            updateColumnState();
          }}
          hasExistingData={
            content.columns.length > 0 || content.rows.length > 0
          }
          locale={locale}
        />
      )}

      <DeleteTableModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteTable}
      />
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onSave={handleLocaleChange}
        initialLocale={locale}
      />

      {cellContextMenuPosition && cellContextMenuParams && (
        <CellContextMenu
          id="cell-context-menu"
          position={cellContextMenuPosition}
          params={cellContextMenuParams}
          onClose={handleCellContextMenuClose}
          setContent={setContent}
          content={content}
          gridRef={gridRef}
        />
      )}

      {gridRef.current &&
        content.columns.map((col) => (
          <HeaderContextMenu
            key={col.field}
            id={`header-context-menu-${col.field}`}
            params={{
              column: gridRef.current.api
                .getColumnState()
                .find((c) => c.colId === col.field),
              api: gridRef.current.api
            }}
            content={content}
            setContent={setContent}
            updateNode={(id, updates) =>
              updateNode(id, updates as Partial<Node>)
            }
            gridRef={gridRef}
          />
        ))}
    </div>
  );
};

export default TableNodeGrid;
