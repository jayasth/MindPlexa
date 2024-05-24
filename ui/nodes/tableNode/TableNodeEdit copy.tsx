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
  AddColumnButton,
  AddRowButton,
  ExportButton,
  ImportButton
} from '@/ui/nodes/tableNode/TableNodeComponents';
import { SketchPicker } from 'react-color';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

import {
  handleTitleChange,
  addColumn,
  addRow,
  importTableData,
  exportTableData
} from '@/ui/nodes/tableNode/TableFunctions';

import {
  handleSave,
  handleDelete,
  handleAddTag,
  handleAttachFile,
  handleChangeColor,
  handleClose,
  handleDuplicate,
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

const DraggableRow = ({ index, moveRow, ...props }) => {
  const ref = useRef(null);
  const [, drop] = useDrop({
    accept: 'row',
    hover(item: { index: number }) {
      if (item.index !== index) {
        moveRow(item.index, index);
        item.index = index;
      }
    }
  });
  const [, drag] = useDrag({
    type: 'row',
    item: { index }
  });
  drag(drop(ref));
  return <div ref={ref} {...props} />;
};

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

  const updateNode = useStore((state) => state.updateNode);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('TableNodeEdit: Content updated', content);
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

  const handleChangeComplete = (color, event) => {
    const rgbaColor = `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`;
    const newTextColor = getContrastYIQ(rgbaColor);
    setTextColor(newTextColor);
    handleChangeColor(data.id, rgbaColor, setBackgroundColor);
  };

  const onAddTag = (newTag: string) => {
    setTags([...tags, newTag]);
  };

  const onAttachFiles = (files: File[]) => {
    setAttachedFiles(files);
  };

  useEffect(() => {
    console.log('TableNodeEdit: Node dimensions updated', { width, height });
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
    console.log(
      'TableNodeEdit: Document event listeners for color picker added'
    );
    if (typeof document !== 'undefined') {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, []);

  const moveRow = (dragIndex, hoverIndex) => {
    const newRows = [...content.rows];
    const [draggedRow] = newRows.splice(dragIndex, 1);
    newRows.splice(hoverIndex, 0, draggedRow);
    setContent({ ...content, rows: newRows });
  };

  // Define custom CSS properties
  const customStyles: CSSProperties = {
    width: nodeWidth,
    height: nodeHeight,
    backgroundColor,
    color: textColor
  };

  return (
    <DndProvider backend={HTML5Backend}>
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
          <AddColumnButton onClick={() => addColumn(content, setContent)} />
          <AddRowButton onClick={() => addRow(content, setContent)} />
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
                editable: true,
                resizable: true,
                cellStyle: { borderRight: '1px solid #ccc' }
              }))}
              rowData={content.rows}
              onGridReady={(params) => params.api.sizeColumnsToFit()}
              domLayout="autoHeight"
              defaultColDef={{
                editable: true,
                resizable: true
              }}
              components={{
                rowRenderer: (params) => (
                  <DraggableRow
                    index={params.node.rowIndex}
                    moveRow={moveRow}
                    {...params}
                  />
                )
              }}
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
            <div
              className={`${styles.colorPicker} nodrag`}
              ref={colorPickerRef}
            >
              <SketchPicker
                color={backgroundColor}
                onChangeComplete={handleChangeComplete}
              />
            </div>
          )}
        </div>
        <div className={styles.tagContainer}>
          {tags.map((tag, index) => (
            <span
              key={index}
              className={styles.tag}
              style={{ color: textColor }}
            >
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
      </div>
    </DndProvider>
  );
};

export default TableNodeEdit;
