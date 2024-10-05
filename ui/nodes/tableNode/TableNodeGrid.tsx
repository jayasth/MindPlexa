import React, { useRef, useCallback, useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import styles from '@/ui/nodes/tableNode/styles/TableNodeEdit.module.css';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

import {
  addColumn,
  addRow,
  importTableData,
  exportTableData,
  onCellValueChanged,
  getColumnDefs,
  gridOptions as existingOptions
} from '@/ui/nodes/tableNode/utils/TableFunctions';

import CustomHeader from '@/ui/nodes/tableNode/components/CustomHeader';
import HeaderContextMenu from '@/ui/nodes/tableNode/components/HeaderContextMenu';
import CellContextMenu from '@/ui/nodes/tableNode/components/CellContextMenu';
import { DateEditor } from '@/ui/nodes/tableNode/components/DateEditor';
import AddTableModal from '@/ui/nodes/tableNode/components/AddTableModal';

import {
  useKeyPressHandler,
  onCellKeyDown
} from '@/ui/nodes/tableNode/utils/KeyboardMouseHandlers';

import {
  AddColumnButton,
  AddRowButton,
  ExportButton,
  ImportButton,
  DeleteTableButton,
  SettingsButton
} from '@/ui/nodes/tableNode/components/TableNodeToolbar';

interface Column {
  headerName: string;
  field: string;
  editable: boolean;
  type: string;
}

interface Content {
  columns: Column[];
  rows: Record<string, string | number | boolean | Date | null>[];
}

interface TableNodeGridProps {
  content: Content;
  setContent: React.Dispatch<React.SetStateAction<Content>>;
  updateNode: (
    nodeId: string,
    canvasId: string,
    updates: {
      columns: Column[];
      rows: Record<string, string | number | boolean | Date | null>[];
      dateFormat?: string;
    }
  ) => void;
  nodeId: string;
  canvasId: string;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsDeleteModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsSettingsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleDeleteTable: () => void;
  dateFormat: string;
}

const TableNodeGrid: React.FC<TableNodeGridProps> = ({
  content,
  setContent,
  updateNode,
  nodeId,
  canvasId,
  setIsDeleteModalOpen,
  setIsSettingsModalOpen,
  handleDeleteTable,
  dateFormat
}) => {
  const gridRef = useRef<AgGridReact>(null);
  const [isAddTableModalOpen, setIsAddTableModalOpen] = useState(false);

  useKeyPressHandler(content, setContent, updateNode, gridRef);

  const handleCellClick = useCallback(() => {
    if (gridRef.current) {
      gridRef.current.api.deselectAll();
    }
  }, []);

  const gridOptions = useMemo(
    () => ({
      ...existingOptions,
      onCellClicked: handleCellClick
    }),
    [handleCellClick]
  );

  const columnDefs = useMemo(() => {
    return getColumnDefs(
      content,
      setContent,
      updateNode,
      gridRef,
      dateFormat
    ).map((colDef) => {
      if (colDef.type === 'date') {
        return {
          ...colDef,
          cellEditor: DateEditor,
          cellEditorParams: {
            dateFormat: dateFormat
          }
        };
      }
      return colDef;
    });
  }, [content, setContent, updateNode, dateFormat]);

  const updateColumnState = useCallback(() => {
    if (gridRef.current) {
      gridRef.current.api.refreshHeader();
    }
  }, []);

  const [cellContextMenuPosition, setCellContextMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const handleCellContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    setCellContextMenuPosition({ x: event.clientX, y: event.clientY });
  }, []);

  const handleAddTable = useCallback(
    (columns: Array<{ name: string; type: string }>, rows: number) => {
      const newColumns: Column[] = columns.map((col, index) => ({
        headerName: col.name || `Column ${index + 1}`,
        field: `col${index + 1}`,
        editable: true,
        type: col.type
      }));

      const newRows: Record<string, string | number | boolean | Date | null>[] =
        Array.from({ length: rows }, () =>
          newColumns.reduce(
            (acc, col) => {
              acc[col.field] = '';
              return acc;
            },
            {} as Record<string, string | number | boolean | Date | null>
          )
        );

      setContent({ columns: newColumns, rows: newRows });
      updateNode(nodeId, canvasId, {
        columns: newColumns,
        rows: newRows,
        dateFormat
      });
      setIsAddTableModalOpen(false);
    },
    [nodeId, canvasId, dateFormat, setContent, updateNode]
  );

  const memoizedGrid = useMemo(
    () => (
      <div
        className={`${styles.tableContent} nowheel nodrag`}
        onContextMenu={handleCellContextMenu}
      >
        <div className={styles.toolbar}>
          <button onClick={() => setIsAddTableModalOpen(true)}>
            Add Table
          </button>
          <AddColumnButton
            onClick={(columnType) => {
              addColumn(
                content,
                setContent,
                {
                  refreshCells: ({ force }) => {
                    const updates = {
                      columns: content.columns,
                      rows: content.rows
                    };
                    updateNode(nodeId, canvasId, updates);
                    if (force) {
                      updateColumnState();
                    }
                  }
                },
                columnType
              );
            }}
            aria-label="Add Column"
          />
          <AddRowButton
            onClick={() =>
              addRow(content, setContent, {
                refreshCells: ({ force }) => {
                  const updates = {
                    columns: content.columns,
                    rows: content.rows
                  };
                  updateNode(nodeId, canvasId, updates);
                  if (force) {
                    updateColumnState();
                  }
                }
              })
            }
            aria-label="Add Row"
          />
          <ImportButton
            onChange={(e) => importTableData(e, setContent)}
            content={content}
            aria-label="Import Table"
          />
          <ExportButton
            onClick={() => exportTableData(content)}
            aria-label="Export Table"
          />
          <DeleteTableButton
            onClick={() => {
              if (content.columns.length > 0 || content.rows.length > 0) {
                setIsDeleteModalOpen(true);
              } else {
                handleDeleteTable();
              }
            }}
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
            columnDefs={columnDefs}
            rowData={content.rows}
            domLayout="autoHeight"
            rowHeight={30}
            headerHeight={30}
            floatingFiltersHeight={30}
            defaultColDef={{
              resizable: true,
              editable: true,
              headerComponent: CustomHeader,
              headerComponentParams: {
                menuIcon: 'fa-bars'
              }
            }}
            onGridReady={(params) => {
              if (gridRef.current) {
                gridRef.current.api = params.api;
                params.api.sizeColumnsToFit();
              }
            }}
            onCellValueChanged={(event) => {
              onCellValueChanged(
                event,
                setContent,
                nodeId,
                canvasId,
                updateNode,
                dateFormat
              );
            }}
            onCellKeyDown={onCellKeyDown}
            ref={gridRef}
          />
        </div>

        {gridRef.current &&
          content.columns.map((col) => (
            <HeaderContextMenu
              key={col.field}
              id={`header-context-menu-${col.field}`}
              params={{
                column: gridRef.current?.api
                  ?.getColumnState()
                  ?.find((c) => c.colId === col.field),
                api: gridRef.current?.api
              }}
              content={content}
              setContent={setContent}
              gridRef={gridRef}
            />
          ))}
        {cellContextMenuPosition && (
          <CellContextMenu
            id="cell-context-menu"
            position={cellContextMenuPosition}
            setContent={
              setContent as React.Dispatch<
                React.SetStateAction<{
                  columns: { field: string }[];
                  rows: Record<string, string>[];
                }>
              >
            }
            content={
              content as {
                columns: { field: string }[];
                rows: Record<string, string>[];
              }
            }
            gridRef={
              gridRef as unknown as React.MutableRefObject<{
                api: {
                  getFocusedCell: () => {
                    rowIndex: number;
                    column: { colId: string };
                  } | null;
                  getRowNode: (index: number) => {
                    data: Record<string, string>;
                    setDataValue: (field: string, value: string) => void;
                  };
                  refreshCells: (params: { force: boolean }) => void;
                  getSelectedRows: () => Record<string, string>[];
                };
              }>
            }
          />
        )}
        <AddTableModal
          isOpen={isAddTableModalOpen}
          onClose={() => setIsAddTableModalOpen(false)}
          onAddTable={handleAddTable}
          hasExistingData={
            content.columns.length > 0 || content.rows.length > 0
          }
        />
      </div>
    ),
    [
      content,
      setContent,
      updateNode,
      handleCellContextMenu,
      cellContextMenuPosition,
      dateFormat,
      isAddTableModalOpen,
      handleAddTable,
      updateColumnState,
      columnDefs,
      handleDeleteTable,
      setIsDeleteModalOpen,
      setIsSettingsModalOpen,
      gridOptions,
      nodeId,
      canvasId
    ]
  );

  return memoizedGrid;
};

export default React.memo(TableNodeGrid);
