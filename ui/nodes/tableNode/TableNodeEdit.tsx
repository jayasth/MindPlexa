import React, {
  useState,
  useEffect,
  useRef,
  CSSProperties,
  useCallback,
  useMemo
} from 'react';
import { NodeProps, Handle, Position, NodeResizer } from 'reactflow';
import { AgGridReact } from 'ag-grid-react';
import useNodeStore from '@/app/store/nodes/useNodeStore';
import useCanvasStore from '@/app/store/canvas/useCanvasStore';
import styles from '@/ui/nodes/tableNode/styles/TableNodeEdit.module.css';
import edgeStyles from '@/ui/edges/CustomEdgeStyles.module.css';
import {
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
import NodeDeleteConfirmationModal from '@/ui/nodes/common/NodeDeleteConfirmationModal';
import TagFileContainer from '@/ui/nodes/common/TagFileContainer';
import {
  handleTitleChange,
  handleClose,
  handleDelete as handleDeleteNode,
  colorCombinations,
  handleAddTag,
  handleDuplicate
} from '@/ui/nodes/common/CommonNodeFunctions';
import {
  Attachment,
  removeAttachment,
  getAttachments,
  removeAllPreviews
} from '@/utils/canvas/attachmentService';
import { useBackgroundColorChange } from '@/ui/nodes/common/useBackgroundColorChange';

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

import { TableNodeData } from '@/ui/canvasEditor/utils/nodeDatatypes';

import CustomHeader from '@/ui/nodes/tableNode/components/CustomHeader';
import HeaderContextMenu from '@/ui/nodes/tableNode/components/HeaderContextMenu';
import CellContextMenu from '@/ui/nodes/tableNode/components/CellContextMenu';

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
  console.log('TableNodeEdit: Node details:', {
    id: data.id,
    title: data.title,
    columns: data.columns,
    rows: data.rows,
    backgroundColor: data.backgroundColor,
    textColor: data.textColor,
    width,
    height,
    position
  });

  const { canvasId } = useCanvasStore();
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
  const [attachedFiles, setAttachedFiles] = useState<Attachment[]>([]);
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

  const updateNode = useNodeStore((state) => state.updateNode);
  const tableRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<any>(null);

  useEffect(() => {
    if (
      title !== data.title ||
      content.columns !== data.columns ||
      content.rows !== data.rows ||
      tags !== data.tags ||
      attachedFiles !== data.attachedFiles ||
      backgroundColor !== data.backgroundColor ||
      textColor !== data.textColor
    ) {
      updateNode(data.id, canvasId, {
        title,
        columns: content.columns,
        rows: content.rows,
        tags,
        attachedFiles,
        backgroundColor,
        textColor
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
    canvasId,
    updateNode
  ]);

  useEffect(() => {
    const fetchAttachments = async () => {
      const attachments = await getAttachments(data.id);
      setAttachedFiles(attachments);
    };
    fetchAttachments();
  }, [data.id]);

  const onChangeTitle = (newTitle: string) => {
    handleTitleChange(data.id, newTitle, setTitle, canvasId);
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
    handleAddTag(data.id, uniqueTags, () => {}, canvasId);
  };

  const onRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(updatedTags);
    handleAddTag(data.id, updatedTags, () => {}, canvasId);
  };

  const onAttachFiles = async (files: File[]) => {
    const attachments = await Promise.all(
      files.map(async (file) => {
        const attachment = await uploadAttachment(data.id, file);
        return attachment;
      })
    );
    setAttachedFiles((prevAttachments) => [...prevAttachments, ...attachments]);
  };

  const onRemoveFile = async (fileId: string) => {
    await removeAttachment(fileId);
    setAttachedFiles((prevAttachments) =>
      prevAttachments.filter((file) => file.id !== fileId)
    );
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    handleDeleteNode(data.id, canvasId);
    setIsDeleteModalOpen(false);
  };

  const handleContainerClick = () => {
    setIsContainerSelected(true);
  };

  const handleContainerBlur = () => {
    setIsContainerSelected(false);
  };

  useEffect(() => {
    setNodeWidth(width);
    setNodeHeight(height);
  }, [width, height]);

  const handleResize = useCallback((event, { width, height }) => {
    setNodeWidth(width);
    setNodeHeight(height);
  }, []);

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

  const memoizedTagFileContainer = useMemo(
    () => (
      <TagFileContainer
        tags={tags}
        attachedFiles={attachedFiles}
        onRemoveTag={onRemoveTag}
        onRemoveFile={onRemoveFile}
        textColor={textColor}
      />
    ),
    [tags, attachedFiles, onRemoveTag, onRemoveFile, textColor]
  );

  return (
    <div>
      {errorMessage && (
        <div className={styles.errorMessage}>{errorMessage}</div>
      )}
      <div
        className={`${styles.tableNode} ${isSelected ? styles.selected : ''}`}
        style={customStyles}
        onClick={handleContainerClick}
        onBlur={handleContainerBlur}
        ref={tableRef}
      >
        <NodeResizer
          isVisible={isContainerSelected}
          minWidth={200}
          minHeight={200}
          onResize={handleResize}
          onResizeEnd={(event, { width, height }) => {
            onNodeResizeStop(data.id, { width, height }, position);
          }}
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
            onClick={() =>
              handleClose(data.id, () => {}, title, content, canvasId)
            }
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
        {(tags.length > 0 || attachedFiles.length > 0) &&
          memoizedTagFileContainer}
        <div className={styles.footer}>
          <DeleteButton onClick={() => setIsDeleteModalOpen(true)} />
          <ChangeColorButton onClick={toggleColorPicker} />
          <AddTagButton onClick={() => setIsTagModalOpen(true)} />
          <AttachFileButton onClick={() => setIsFileModalOpen(true)} />
          <DuplicateButton onClick={() => handleDuplicate(data.id, canvasId)} />
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
          nodeId={data.id}
        />
        <NodeDeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
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
    </div>
  );
};

export default TableNodeEdit;
