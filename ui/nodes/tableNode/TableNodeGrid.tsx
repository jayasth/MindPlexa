import React, { useRef, useCallback, useMemo } from 'react';
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

interface TableNodeGridProps {
  content: { columns: any[]; rows: any[] };
  setContent: React.Dispatch<
    React.SetStateAction<{ columns: any[]; rows: any[] }>
  >;
  updateNode: (
    nodeId: string,
    canvasId: string,
    updates: { columns: any[]; rows: any[] }
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
  setIsModalOpen,
  setIsDeleteModalOpen,
  setIsSettingsModalOpen,
  handleDeleteTable,
  dateFormat
}) => {
  const gridRef = useRef<any>(null);

  useKeyPressHandler(content, setContent, updateNode, gridRef);

  const handleCellClick = useCallback(
    (event) => {
      if (gridRef.current) {
        gridRef.current.api.deselectAll();
      }
    },
    [gridRef]
  );

  const gridOptions = {
    ...existingOptions,
    onCellClicked: handleCellClick,
    components: {
      dateEditor: (props) => <DateEditor {...props} dateFormat={dateFormat} />
    }
  };

  const columnDefs = getColumnDefs(content, setContent, updateNode, gridRef);

  const updateColumnState = () => {
    if (gridRef.current) {
      gridRef.current.api.refreshHeader();
    }
  };

  const [cellContextMenuPosition, setCellContextMenuPosition] = React.useState<{
    x: number;
    y: number;
  } | null>(null);
  const [cellContextMenuParams, setCellContextMenuParams] =
    React.useState<any>(null);

  const handleCellContextMenu = useCallback(
    (event: React.MouseEvent, params: any) => {
      event.preventDefault();
      setCellContextMenuPosition({ x: event.clientX, y: event.clientY });
      setCellContextMenuParams(params);
    },
    [setCellContextMenuPosition, setCellContextMenuParams]
  );

  const handleCellContextMenuClose = () => {
    setCellContextMenuPosition(null);
    setCellContextMenuParams(null);
  };

  const memoizedGrid = useMemo(
    () => (
      <div
        className={`${styles.tableContent} nowheel nodrag`}
        onContextMenu={(event) => handleCellContextMenu(event, event)}
      >
        <div className={styles.toolbar}>
          <AddTableButton
            onClick={() => setIsModalOpen(true)}
            aria-label="Add Table"
          />
          <AddColumnButton
            onClick={(columnType) => {
              addColumn(content, setContent, updateNode, columnType);
              updateColumnState();
            }}
            aria-label="Add Column"
          />
          <AddRowButton
            onClick={() => addRow(content, setContent, updateNode)}
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
              headerComponentParams: {
                menuIcon: 'fa-bars'
              }
            }}
            onGridReady={(params) => {
              gridRef.current = params;
              params.api.sizeColumnsToFit();
            }}
            onCellValueChanged={(event) => {
              onCellValueChanged(event, setContent);
              updateNode(nodeId, canvasId, {
                columns: content.columns,
                rows: content.rows
              });
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
                column: gridRef.current.api
                  ?.getColumnState()
                  ?.find((c) => c.colId === col.field),
                api: gridRef.current.api
              }}
              content={content}
              setContent={setContent}
              updateNode={updateNode}
              gridRef={gridRef}
            />
          ))}
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
      </div>
    ),
    [
      content,
      setContent,
      updateNode,
      handleCellContextMenu,
      cellContextMenuPosition,
      cellContextMenuParams,
      dateFormat,
      nodeId,
      canvasId
    ]
  );

  return memoizedGrid;
};

export default React.memo(TableNodeGrid);
