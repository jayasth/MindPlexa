import React, {
  useState,
  useEffect,
  useRef,
  CSSProperties,
  useCallback
} from 'react';
import { NodeProps, Handle, Position, NodeResizer } from 'reactflow';
import { AgGridReact } from 'ag-grid-react';
import { useStore } from '@/app/store/useCanvasStore';
import styles from '@/ui/nodes/tableNode/styles/TableNodeEdit.module.css';
import edgeStyles from '@/ui/edges/CustomEdgeStyles.module.css';
import {
  SaveButton,
  DeleteButton,
  ChangeColorButton,
  AddTagButton,
  AttachFileButton,
  CloseButton,
  DuplicateButton,
  TagModal,
  FileModal,
  ColorPickerModal
} from '@/ui/nodes/common/CommonNodeComponents';
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

import {
  addColumn,
  addRow,
  importTableData,
  exportTableData,
  onCellValueChanged,
  validateCellValue,
  getColumnDefs,
  gridOptions as existingOptions
} from '@/ui/nodes/tableNode/utils/TableFunctions';

import {
  handleTitleChange,
  handleSave,
  handleDelete,
  handleAddTag,
  handleClose,
  handleDuplicate,
  handleRemoveAttachedFile,
  colorCombinations,
  handleAttachmentPreview
} from '@/ui/nodes/common/CommonNodeFunctions';

import { useBackgroundColorChange } from '@/ui/nodes/common/useBackgroundColorChange';

import { TableNodeData } from '@/ui/canvasEditor/utils/nodeDatatypes';

import CustomHeader from '@/ui/nodes/tableNode/components/CustomHeader';
import HeaderContextMenu from '@/ui/nodes/tableNode/components/HeaderContextMenu';
import CellContextMenu from '@/ui/nodes/tableNode/components/CellContextMenu';

import TagFileContainer from '@/ui/nodes/common/TagFileContainer';

import {
  useKeyPressHandler,
  onCellKeyDown
} from '@/ui/nodes/tableNode/utils/KeyboardMouseHandlers';

interface TableNodeEditProps extends NodeProps {
  data: TableNodeData;
  width: number;
  height: number;
  selected: boolean;
  onNodeResizeStop: (
    nodeId: string,
    newSize: { width: number; height: number },
    newPosition: { x: number; y: number }
  ) => void;
  position: { x: number; y: number };
}

const TableNodeEdit: React.FC<TableNodeEditProps> = ({
  data,
  width,
  height,
  selected,
  onNodeResizeStop,
  position
}) => {
  const [isSelected, setIsSelected] = useState(selected);
  const [title, setTitle] = useState(data.title || 'Untitled Table');
  const [content, setContent] = useState({
    columns: data.columns || [],
    rows: data.rows || []
  });
  const [backgroundColor, setBackgroundColor] = useState(
    data.backgroundColor || '#F4F4F4'
  );
  const [textColor, setTextColor] = useState(data.textColor || '#575757');
  const [tags, setTags] = useState<string[]>(data.tags || []);
  const [attachedFiles, setAttachedFiles] = useState<File[]>(
    data.attachedFiles || []
  );
  const [isContainerSelected, setIsContainerSelected] = useState(false);
  const [nodeWidth, setNodeWidth] = useState(width);
  const [nodeHeight, setNodeHeight] = useState(height);
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [locale, setLocale] = useState('en-US'); // Default locale
  const [errorMessage, setErrorMessage] = useState('');

  const [cellContextMenuPosition, setCellContextMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [cellContextMenuParams, setCellContextMenuParams] = useState<any>(null);

  const updateNode = useStore((state) => state.updateNode);
  const tableRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<any>(null);

  useEffect(() => {
    if (
      title !== data.title ||
      content.columns !== data.columns ||
      content.rows !== data.rows ||
      tags.length > 0 ||
      attachedFiles.length > 0 ||
      backgroundColor !== data.backgroundColor ||
      textColor !== data.textColor
    ) {
      updateNode(data.id, {
        data: {
          title,
          columns: content.columns,
          rows: content.rows,
          tags,
          attachedFiles,
          backgroundColor,
          textColor
        }
      });
    }
  }, [
    title,
    content,
    tags,
    attachedFiles,
    backgroundColor,
    textColor,
    data.id,
    updateNode
  ]);

  const onChangeTitle = (newTitle: string) => {
    handleTitleChange(data.id, newTitle, setTitle);
  };

  const handleBackgroundColorChange = useBackgroundColorChange(
    data.id,
    setBackgroundColor,
    setTextColor
  );

  const onChangeColor = (color: { hex: string }) => {
    handleBackgroundColorChange(color);
  };

  const onAddTag = (newTags: string[]) => {
    const uniqueTags = Array.from(new Set([...tags, ...newTags]));
    setTags(uniqueTags);
    handleAddTag(data.id, uniqueTags, () => {});
  };

  const onRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(updatedTags);
    handleAddTag(data.id, updatedTags, () => {});
  };

  const onAttachFiles = (files: File[]) => {
    setAttachedFiles(files);
  };

  const onRemoveFile = (fileToRemove: File) => {
    handleRemoveAttachedFile(data.id, fileToRemove, () => {});
  };

  useEffect(() => {
    setTags(data.tags || []);
    setAttachedFiles(data.attachedFiles || []);
  }, [data.tags, data.attachedFiles]);

  useEffect(() => {
    setNodeWidth(width);
    setNodeHeight(height);
  }, [width, height]);

  const handleResize = useCallback((event, { width, height }) => {
    setNodeWidth(width);
    setNodeHeight(height);
  }, []);

  const handleResizeEnd = useCallback(
    (event, { width, height }) => {
      onNodeResizeStop(data.id, { width, height }, position);
    },
    [data.id, onNodeResizeStop, position]
  );

  const toggleColorPicker = () => {
    setIsColorPickerVisible(!isColorPickerVisible);
  };

  const handleDeleteTable = () => {
    setContent({ columns: [], rows: [] });
    setIsDeleteModalOpen(false);
  };

  const handleLocaleChange = (newLocale) => {
    setLocale(newLocale);
    // Apply locale settings to existing columns and rows if necessary
  };

  const handleCellContextMenu = useCallback(
    (event: React.MouseEvent, params: any) => {
      event.preventDefault();
      console.log('TableNodeEdit: handleCellContextMenu params:', params);
      setCellContextMenuPosition({ x: event.clientX, y: event.clientY });
      setCellContextMenuParams(params);
    },
    [setCellContextMenuPosition, setCellContextMenuParams]
  );

  const handleCellContextMenuClose = () => {
    setCellContextMenuPosition(null);
    setCellContextMenuParams(null);
  };

  const customStyles: CSSProperties = {
    width: nodeWidth,
    height: nodeHeight,
    backgroundColor,
    color: textColor
  };

  const columnDefs = getColumnDefs(content, setContent, updateNode, gridRef);

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
    onCellClicked: handleCellClick
  };

  const updateColumnState = () => {
    if (gridRef.current) {
      gridRef.current.api.refreshHeader();
    }
  };

  return (
    <div>
      {errorMessage && (
        <div className={styles.errorMessage}>{errorMessage}</div>
      )}
      <div
        className={`${styles.tableNode} ${isSelected ? styles.selected : ''}`}
        style={customStyles}
        onClick={() => setIsContainerSelected(true)}
        onBlur={() => setIsContainerSelected(false)}
        ref={tableRef}
      >
        <NodeResizer
          isVisible={isContainerSelected}
          minWidth={200}
          minHeight={200}
          onResize={handleResize}
          onResizeEnd={handleResizeEnd}
        />
        <div className={styles.header}>
          <input
            type="text"
            value={title}
            onChange={(e) => onChangeTitle(e.target.value)}
            className={`${styles.titleInput} nodrag`}
            style={{ color: textColor }}
            aria-label="Table Title"
          />
          <CloseButton
            onClick={() => handleClose(data.id, () => {}, title, content)}
            aria-label="Close Table"
          />
        </div>

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
                addColumn(content, setContent, updateNode, columnType, locale);
                updateColumnState();
              }}
              aria-label="Add Column"
              locale={locale} // Pass locale to AddColumnButton
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
              }}
              onCellKeyDown={onCellKeyDown}
              ref={gridRef}
            />
          </div>
        </div>
        <TagFileContainer
          tags={tags}
          attachedFiles={attachedFiles}
          onRemoveTag={onRemoveTag}
          onRemoveFile={onRemoveFile}
          textColor={textColor}
          handleAttachmentPreview={handleAttachmentPreview}
        />
        <div className={styles.footer}>
          <SaveButton
            onClick={() =>
              handleSave(data.id, () => {}, {
                title,
                columns: content.columns,
                rows: content.rows,
                tags,
                attachedFiles
              })
            }
            aria-label="Save Table"
          />
          <DeleteButton
            onClick={() => handleDelete(data.id, () => {})}
            aria-label="Delete Table"
          />
          <ChangeColorButton
            onClick={() => toggleColorPicker()}
            aria-label="Change Color"
          />
          <AddTagButton
            onClick={() => setIsTagModalOpen(true)}
            aria-label="Add Tag"
          />
          <AttachFileButton
            onClick={() => setIsFileModalOpen(true)}
            aria-label="Attach File"
          />
          <DuplicateButton
            onClick={() => handleDuplicate(data.id)}
            aria-label="Duplicate Table"
          />
          <ColorPickerModal
            isOpen={isColorPickerVisible}
            onClose={() => setIsColorPickerVisible(false)}
            currentColor={backgroundColor}
            onChangeColor={onChangeColor}
            colorCombinations={colorCombinations}
          />
        </div>
        <Handle
          type="target"
          position={Position.Top}
          className={`${edgeStyles.reactFlowHandle} ${edgeStyles.reactFlowHandleTop}`}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          className={`${edgeStyles.reactFlowHandle} ${edgeStyles.reactFlowHandleBottom}`}
        />
        <TagModal
          isOpen={isTagModalOpen}
          onClose={() => setIsTagModalOpen(false)}
          onAddTag={onAddTag}
          onRemoveTag={onRemoveTag}
          existingTags={tags}
        />
        <FileModal
          isOpen={isFileModalOpen}
          onClose={() => setIsFileModalOpen(false)}
          onAttachFiles={onAttachFiles}
          onRemoveFile={onRemoveFile}
          existingFiles={attachedFiles}
          data={data}
        />
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
                locale // Pass locale to column definition
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
            locale={locale} // Pass locale to AddTableModal
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
    </div>
  );
};

export default TableNodeEdit;
