import React, {
  useState,
  useEffect,
  useRef,
  CSSProperties,
  useCallback,
  useMemo
} from 'react';
import { NodeProps, Handle, Position, NodeResizer } from 'reactflow';
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
import AddTableModal from '@/ui/nodes/tableNode/components/AddTableModal';
import SettingsModal from '@/ui/nodes/tableNode/components/SettingsModal';
import DeleteTableModal from '@/ui/nodes/tableNode/components/DeleteTableModal';
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
import TableNodeGrid from '@/ui/nodes/tableNode/TableNodeGrid';
import { format, parse, isValid } from 'date-fns';

import debounce from 'lodash/debounce';

interface TableNodeEditProps extends NodeProps {
  data: any;
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
  const [isNodeDeleteModalOpen, setIsNodeDeleteModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [dateFormat, setDateFormat] = useState(data.dateFormat || 'yyyy-MM-dd');

  const updateNode = useNodeStore((state) => state.updateNode);
  const tableRef = useRef<HTMLDivElement>(null);

  const handleBackgroundColorChange = useBackgroundColorChange(
    data.id,
    setBackgroundColor,
    setTextColor
  );

  const onChangeColor = useCallback(
    (color: { hex: string }) => {
      handleBackgroundColorChange(color);
    },
    [handleBackgroundColorChange]
  );

  const debouncedUpdateNode = useMemo(
    () =>
      debounce((nodeId, updates) => {
        updateNode(nodeId, updates, canvasId);
      }, 500),
    [updateNode, canvasId]
  );

  useEffect(() => {
    const commonData = {
      title,
      backgroundColor,
      textColor,
      editWidth: nodeWidth,
      editHeight: nodeHeight
    };

    const specificData = {
      columns: content.columns,
      rows: content.rows,
      tags,
      attachedFiles,
      dateFormat
    };

    debouncedUpdateNode(data.id, { ...commonData, data: specificData });
  }, [
    title,
    content,
    backgroundColor,
    textColor,
    nodeWidth,
    nodeHeight,
    tags,
    attachedFiles,
    dateFormat,
    data.id,
    debouncedUpdateNode
  ]);

  useEffect(() => {
    return () => {
      removeAllPreviews();
    };
  }, []);

  const handleDeleteTable = () => {
    setContent({ columns: [], rows: [] });
    setIsDeleteModalOpen(false);
  };

  const onChangeTitle = useCallback(
    (newTitle: string) => {
      handleTitleChange(data.id, newTitle, setTitle, canvasId);
    },
    [data.id, canvasId]
  );

  const onAddTag = useCallback(
    (newTags: string[]) => {
      const uniqueTags = Array.from(new Set([...tags, ...newTags]));
      setTags(uniqueTags);
      handleAddTag(data.id, [...uniqueTags], () => {}, canvasId);
    },
    [data.id, tags, canvasId]
  );

  const onRemoveTag = useCallback(
    (tagToRemove: string) => {
      const updatedTags = tags.filter((tag) => tag !== tagToRemove);
      setTags(updatedTags);
      handleAddTag(data.id, updatedTags, () => {}, canvasId);
    },
    [data.id, tags, canvasId]
  );

  const onAttachFiles = useCallback(async (files: Attachment[]) => {
    setAttachedFiles(files);
  }, []);

  const onRemoveFile = useCallback(
    async (fileId: string) => {
      await removeAttachment(fileId);
      const updatedAttachments = await getAttachments(data.id);
      setAttachedFiles(updatedAttachments);
    },
    [data.id]
  );

  useEffect(() => {
    const fetchAttachments = async () => {
      const attachments = await getAttachments(data.id);
      setAttachedFiles(attachments);
    };
    fetchAttachments();
  }, [data.id]);

  useEffect(() => {
    setNodeWidth(width);
    setNodeHeight(height);
  }, [width, height]);

  const handleResize = useCallback(
    (event, { width, height }) => {
      setNodeWidth(width);
      setNodeHeight(height);
      onNodeResizeStop(data.id, { width, height }, position);
    },
    [data.id, onNodeResizeStop, position]
  );

  const handleContainerClick = useCallback(() => {
    setIsContainerSelected(true);
  }, []);

  const handleContainerBlur = useCallback(() => {
    setIsContainerSelected(false);
  }, []);

  const toggleColorPicker = useCallback(() => {
    setIsColorPickerVisible((prev) => !prev);
  }, []);

  const customStyles: CSSProperties = useMemo(
    () => ({
      width: nodeWidth,
      height: nodeHeight,
      backgroundColor,
      color: textColor
    }),
    [nodeWidth, nodeHeight, backgroundColor, textColor]
  );

  const handleDelete = () => {
    setIsNodeDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    setIsNodeDeleteModalOpen(false);
    handleDeleteNode(data.id, canvasId);
  };

  const handleDeleteCancel = () => {
    setIsNodeDeleteModalOpen(false);
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

  const handleUpdateNode = useCallback(
    (id: string, updates: any) => {
      updateNode(id, updates, canvasId);
    },
    [updateNode, canvasId]
  );

  const handleDateFormatChange = useCallback(
    (newDateFormat: string) => {
      setDateFormat(newDateFormat);
      const updatedRows = content.rows.map((row) => {
        return content.columns.reduce((acc, col) => {
          if (col.type === 'date' && row[col.field]) {
            const date = parse(row[col.field], 'yyyy-MM-dd', new Date());
            acc[col.field] = isValid(date)
              ? format(date, 'yyyy-MM-dd')
              : row[col.field];
          } else {
            acc[col.field] = row[col.field];
          }
          return acc;
        }, {});
      });
      setContent({ ...content, rows: updatedRows });
      updateNode(
        data.id,
        {
          data: { ...content, rows: updatedRows, dateFormat: newDateFormat }
        },
        canvasId
      );
    },
    [content, setContent, updateNode, data.id, canvasId]
  );

  const handleAddTable = useCallback(
    (columns, rows) => {
      const newColumns = columns.map((col, index) => ({
        headerName: col.name || `Column ${index + 1}`,
        field: `col${index + 1}`,
        editable: true,
        type: col.type,
        defaultValue: ''
      }));

      const newRows = Array.from({ length: rows }, () =>
        newColumns.reduce((acc, col) => {
          acc[col.field] = '';
          return acc;
        }, {})
      );

      setContent({ columns: newColumns, rows: newRows });

      // Update the node data
      updateNode(
        data.id,
        {
          data: {
            columns: newColumns,
            rows: newRows,
            dateFormat
          }
        },
        canvasId
      );

      setIsModalOpen(false); // Close the modal after adding the table
    },
    [data.id, updateNode, canvasId, dateFormat]
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

        <TableNodeGrid
          content={content}
          setContent={setContent}
          updateNode={handleUpdateNode}
          nodeId={data.id}
          canvasId={canvasId}
          setIsModalOpen={setIsModalOpen}
          setIsDeleteModalOpen={setIsDeleteModalOpen}
          setIsSettingsModalOpen={setIsSettingsModalOpen}
          handleDeleteTable={handleDeleteTable}
          dateFormat={dateFormat}
        />

        {(tags.length > 0 || attachedFiles.length > 0) &&
          memoizedTagFileContainer}
        <div className={styles.footer}>
          <DeleteButton onClick={handleDelete} />
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
          isOpen={isNodeDeleteModalOpen}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
        />
        {isModalOpen && (
          <AddTableModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onAddTable={handleAddTable}
            hasExistingData={
              content.columns.length > 0 || content.rows.length > 0
            }
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
          onSave={({ dateFormat }) => handleDateFormatChange(dateFormat)}
          initialDateFormat={dateFormat}
          handleDateFormatChange={handleDateFormatChange}
        />
      </div>
    </div>
  );
};

export default React.memo(TableNodeEdit);
