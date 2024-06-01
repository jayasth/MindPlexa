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
import styles from './TableNodeEdit.module.css';
import edgeStyles from '@/ui/edges/CustomEdgeStyles.module.css';
import {
  SaveButton,
  DeleteButton,
  ChangeColorButton,
  AddTagButton,
  AttachFileButton,
  CloseButton,
  DuplicateButton
} from '@/ui/nodes/CommonNodeComponents';
import {
  AddTableButton,
  AddColumnButton,
  AddRowButton,
  ExportButton,
  ImportButton
} from '@/ui/nodes/tableNode/TableNodeToolbar';
import { CompactPicker } from 'react-color';
import AddTableModal from '@/ui/nodes/tableNode/AddTableModal';
import CustomHeader from '@/ui/nodes/tableNode/CustomHeader';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

import {
  addColumn,
  addRow,
  importTableData,
  exportTableData,
  onCellValueChanged
} from '@/ui/nodes/tableNode/TableFunctions';

import {
  handleTitleChange,
  handleSave,
  handleDelete,
  handleAddTag,
  handleAttachFile,
  handleChangeColorWithCombination,
  handleClose,
  handleDuplicate,
  colorCombinations,
  getContrastYIQ
} from '@/ui/canvasEditor/utils/CommonNodeFunctions';

interface TableNodeEditProps extends NodeProps {
  data: {
    id: string;
    content?: any;
    title?: string;
    backgroundColor?: string;
    textColor?: string;
  };
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
  const [content, setContent] = useState(
    data.content || { columns: [], rows: [] }
  );
  const [backgroundColor, setBackgroundColor] = useState(
    data.backgroundColor || '#F4F4F4'
  );
  const [textColor, setTextColor] = useState(data.textColor || '#575757');
  const [tags, setTags] = useState<string[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isContainerSelected, setIsContainerSelected] = useState(false);
  const [nodeWidth, setNodeWidth] = useState(width);
  const [nodeHeight, setNodeHeight] = useState(height);
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const updateNode = useStore((state) => state.updateNode);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      title !== data.title ||
      content !== data.content ||
      tags.length > 0 ||
      attachedFiles.length > 0 ||
      backgroundColor !== data.backgroundColor ||
      textColor !== data.textColor
    ) {
      updateNode(data.id, {
        data: {
          title,
          content,
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

  const handleBackgroundColorChange = (color, event) => {
    const selectedCombination = colorCombinations.find(
      (combination) => combination.background === color.hex
    );
    if (selectedCombination) {
      setTextColor(selectedCombination.foreground);
      handleChangeColorWithCombination(
        data.id,
        selectedCombination.background,
        selectedCombination.foreground,
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

  const onAddTag = (newTag: string) => {
    setTags([...tags, newTag]);
  };

  const onAttachFiles = (files: File[]) => {
    setAttachedFiles(files);
  };

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

  const handleContainerClick = () => {
    setIsContainerSelected(true);
  };

  const handleContainerBlur = () => {
    setIsContainerSelected(false);
  };

  const toggleColorPicker = () => {
    setIsColorPickerVisible(!isColorPickerVisible);
  };

  const handleClickOutside = (event) => {
    if (
      colorPickerRef.current &&
      !colorPickerRef.current.contains(event.target)
    ) {
      setIsColorPickerVisible(false);
    }
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, []);

  const handleAddTable = (columns, rows) => {
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
  };

  const customStyles: CSSProperties = {
    width: nodeWidth,
    height: nodeHeight,
    backgroundColor,
    color: textColor
  };

  return (
    <div
      className={styles.tableNode}
      style={customStyles}
      onClick={handleContainerClick}
      onBlur={handleContainerBlur}
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
        />
        <CloseButton
          onClick={() => handleClose(data.id, () => {}, title, content)}
        />
      </div>
      <div className={styles.toolbar}>
        <AddTableButton onClick={() => setIsModalOpen(true)} />{' '}
        <AddColumnButton
          onClick={() => addColumn(content, setContent, updateNode)}
        />
        <AddRowButton onClick={() => addRow(content, setContent, updateNode)} />
        <ExportButton onClick={() => exportTableData(content)} />
        <ImportButton onChange={(e) => importTableData(e, setContent)} />
      </div>
      <div className={`${styles.tableContent} nowheel nodrag`}>
        <div
          className="ag-theme-alpine"
          style={{ height: '100%', width: '100%' }}
        >
          <AgGridReact
            columnDefs={content.columns.map((col) => ({
              ...col,
              headerComponent: CustomHeader,
              headerComponentParams: {
                content,
                setContent,
                updateNode
              },
              headerName: col.headerName,
              type: col.type,
              sortable: false,
              filter: false
            }))}
            rowData={content.rows}
            domLayout="autoHeight"
            rowHeight={30}
            defaultColDef={{
              resizable: true,
              editable: true
            }}
            onGridReady={(params) => {
              params.api.sizeColumnsToFit();
            }}
            onCellValueChanged={(event) =>
              onCellValueChanged(event, setContent)
            }
          />
        </div>
      </div>
      <div className={styles.footer}>
        <SaveButton
          onClick={() =>
            handleSave(data.id, () => {}, {
              title,
              content,
              tags,
              attachedFiles
            })
          }
        />
        <DeleteButton onClick={() => handleDelete(data.id, () => {})} />
        <ChangeColorButton onClick={() => toggleColorPicker()} />
        <AddTagButton onClick={() => handleAddTag(data.id, tags, onAddTag)} />
        <AttachFileButton
          onChange={(e) => handleAttachFile(data.id, onAttachFiles)(e)}
        />
        <DuplicateButton onClick={() => handleDuplicate(data.id)} />
        {isColorPickerVisible && (
          <div className={`${styles.colorPicker} nodrag`} ref={colorPickerRef}>
            <CompactPicker
              color={backgroundColor}
              onChange={handleBackgroundColorChange}
              colors={colorCombinations.map(
                (combination) => combination.background
              )}
              styles={{
                default: {
                  input: {
                    height: '16px',
                    fontSize: '12px'
                  },
                  swatch: {
                    width: '20px',
                    height: '20px',
                    position: 'relative'
                  }
                }
              }}
              width="180px"
              className="compact-picker"
            />
            {colorCombinations.map((combination) => (
              <div
                key={combination.background}
                className="compact-picker__swatch"
                style={{ backgroundColor: combination.background }}
                data-name={combination.name}
              />
            ))}
          </div>
        )}
      </div>
      <div className={styles.tagContainer}>
        {tags.map((tag, index) => (
          <span key={index} className={styles.tag} style={{ color: textColor }}>
            {tag}
          </span>
        ))}
      </div>
      {attachedFiles.length > 0 && (
        <div className={styles.attachedFile} style={{ color: textColor }}>
          Attached files: {attachedFiles.map((file) => file.name).join(', ')}
        </div>
      )}
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
      {isModalOpen && (
        <AddTableModal
          onClose={() => setIsModalOpen(false)}
          onAddTable={handleAddTable}
        />
      )}
    </div>
  );
};

export default TableNodeEdit;
