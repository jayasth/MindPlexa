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
} from '@/ui/nodes/CommonNodeComponents';
import {
  AddTableButton,
  AddColumnButton,
  AddRowButton,
  ExportButton,
  ImportButton,
  DeleteTableButton
} from '@/ui/nodes/tableNode/components/TableNodeToolbar';
import AddTableModal from '@/ui/nodes/tableNode/components/AddTableModal';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import Button from '@/ui/Button/Button';
import { Papa } from 'papaparse';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

import {
  addColumn,
  addRow,
  importTableData,
  exportTableData,
  onCellValueChanged,
  handleKeyDown
} from '@/ui/nodes/tableNode/utils/TableFunctions';

import {
  handleTitleChange,
  handleSave,
  handleDelete,
  handleAddTag,
  handleAttachFile,
  handleChangeColorWithCombination,
  handleClose,
  handleDuplicate,
  handleRemoveAttachedFile,
  colorCombinations,
  getContrastYIQ,
  handleAttachmentPreview
} from '@/ui/canvasEditor/utils/CommonNodeFunctions';

import { TableNodeData } from '@/ui/canvasEditor/utils/nodeDatatypes';

import {
  getColumnDefs,
  getContextMenuItems
} from '@/ui/nodes/tableNode/utils/contextMenuItems';
import { useKeyPressHandler } from '@/ui/nodes/tableNode/utils/useKeyPressHandler';

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

  const handleBackgroundColorChange = (color: { hex: string }) => {
    const selectedCombination = colorCombinations.find(
      (combination) =>
        combination.background.toLowerCase() === color.hex.toLowerCase()
    );
    if (selectedCombination) {
      setTextColor(selectedCombination.text);
      handleChangeColorWithCombination(
        data.id,
        selectedCombination.background,
        selectedCombination.text,
        setBackgroundColor
      );
    } else {
      const calculatedTextColor = getContrastYIQ(color.hex);
      setTextColor(calculatedTextColor);
      handleChangeColorWithCombination(
        data.id,
        color.hex,
        calculatedTextColor,
        setBackgroundColor
      );
    }
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
    setContent({ columns: [], rows: [] }); // Clear the table content
    setIsDeleteModalOpen(false); // Close the modal
  };

  const customStyles: CSSProperties = {
    width: nodeWidth,
    height: nodeHeight,
    backgroundColor,
    color: textColor
  };

  const columnDefs = getColumnDefs(content, setContent, updateNode);

  useKeyPressHandler(content, setContent, updateNode, gridRef);

  return (
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

      <div className={`${styles.tableContent} nowheel nodrag`}>
        <div className={styles.toolbar}>
          <AddTableButton
            onClick={() => setIsModalOpen(true)}
            aria-label="Add Table"
          />
          <AddColumnButton
            onClick={(columnType) =>
              addColumn(content, setContent, updateNode, columnType)
            }
            aria-label="Add Column"
          />
          <AddRowButton
            onClick={() => addRow(content, setContent, updateNode)}
            aria-label="Add Row"
          />
          <ExportButton
            onClick={() => exportTableData(content)}
            aria-label="Export Table"
          />
          <ImportButton
            onChange={(e) => importTableData(e, setContent)}
            aria-label="Import Table"
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
        </div>

        <div
          className="ag-theme-alpine"
          style={{ height: '100%', width: '100%' }}
          role="grid"
          aria-label="Data Table"
        >
          <AgGridReact
            columnDefs={columnDefs as any}
            rowData={content.rows}
            domLayout="autoHeight"
            rowHeight={30}
            defaultColDef={{
              resizable: true,
              editable: true
            }}
            onGridReady={(params) => {
              gridRef.current = params;
              params.api.sizeColumnsToFit();
              params.api.addEventListener('keydown', (event) =>
                handleKeyDown(event, gridRef)
              );
            }}
            onCellValueChanged={(event) =>
              onCellValueChanged(event, setContent)
            }
            getContextMenuItems={(params) =>
              getContextMenuItems(params, content, setContent, updateNode)
            }
          />
        </div>
      </div>
      {(tags.length > 0 || attachedFiles.length > 0) && (
        <div className={styles.tagFileContainer}>
          <div className={styles.tagContainer}>
            {tags.map((tag, index) => (
              <span
                key={index}
                className={styles.tag}
                style={{ color: textColor }}
                onClick={() => onRemoveTag(tag)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onRemoveTag(tag);
                  }
                }}
              >
                #{tag}{' '}
                <button className={styles.removeTagButton}>&times;</button>
              </span>
            ))}
          </div>
          <div className={styles.fileContainer}>
            {attachedFiles.map((file, index) => (
              <div key={index} className={styles.file}>
                <span
                  onClick={() => {
                    if (file.type === 'text/plain') {
                      window.open(file.name, '_blank');
                    } else {
                      const url = URL.createObjectURL(file);
                      window.open(url, '_blank');
                    }
                  }}
                  onMouseEnter={() => handleAttachmentPreview(file)}
                  onMouseLeave={() => {
                    const preview = document.querySelector('.file-preview');
                    if (preview) {
                      document.body.removeChild(preview);
                    }
                  }}
                  style={{ cursor: 'pointer', textDecoration: 'underline' }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      if (file.type === 'text/plain') {
                        window.open(file.name, '_blank');
                      } else {
                        const url = URL.createObjectURL(file);
                        window.open(url, '_blank');
                      }
                    }
                  }}
                >
                  {file.name}
                </span>
                <button
                  className={styles.removeFileButton}
                  onClick={() => onRemoveFile(file)}
                  aria-label={`Remove file ${file.name}`}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
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
          onChangeColor={handleBackgroundColorChange}
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
              defaultValue: col.defaultValue
            }));

            const newRows = Array.from({ length: rows }, () =>
              newColumns.reduce((acc, col) => {
                acc[col.field] = col.defaultValue || '';
                return acc;
              }, {})
            );

            setContent({ columns: newColumns, rows: newRows });
          }}
          hasExistingData={
            content.columns.length > 0 || content.rows.length > 0
          }
        />
      )}
      <Modal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        center
      >
        <h2>Confirm Deletion</h2>
        <p>
          Are you sure you want to delete the entire table? This action cannot
          be undone.
        </p>
        <div className={styles.actions}>
          <Button variant="submit" onClick={handleDeleteTable}>
            Yes
          </Button>
          <Button variant="cancel" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default TableNodeEdit;
