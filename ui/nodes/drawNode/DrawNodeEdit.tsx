import React, { useState, useEffect, useRef, CSSProperties } from 'react';
import { NodeProps, Handle, Position, NodeResizer } from 'reactflow';
import { useStore } from '@/app/store/useCanvasStore';
import styles from './DrawNodeEdit.module.css';
import edgeStyles from '@/ui/edges/CustomEdgeStyles.module.css';
import { SketchPicker } from 'react-color';
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
  handleTitleChange,
  handleSave,
  handleDelete,
  handleAddTag,
  handleAttachFile,
  handleClose,
  handleDuplicate
} from '@/ui/canvasEditor/utils/CommonNodeFunctions';
import DrawingToolbar from '@/ui/nodes/drawNode/DrawingToolbar';
import DrawingCanvas from '@/ui/nodes/drawNode/DrawingCanvas';
import {
  handleBackgroundColorChange,
  handleStrokeColorChange,
  handleStrokeWidthChange,
  undo,
  redo
} from '@/ui/nodes/drawNode/drawUtils';
import { useDrawing } from '@/ui/nodes/drawNode/drawLogic';

interface DrawNodeEditProps extends NodeProps {
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

const DrawNodeEdit: React.FC<DrawNodeEditProps> = ({
  data,
  width,
  height,
  selected,
  onNodeResizeStop,
  position
}) => {
  const [isSelected, setIsSelected] = useState(selected);
  const [title, setTitle] = useState(data.title || 'Untitled Drawing');
  const [backgroundColor, setBackgroundColor] = useState(
    data.backgroundColor || '#F4F4F4'
  );
  const [textColor, setTextColor] = useState(data.textColor || '#575757');
  const [tags, setTags] = useState<string[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isContainerSelected, setIsContainerSelected] = useState(false);
  const [nodeWidth, setNodeWidth] = useState(width);
  const [nodeHeight, setNodeHeight] = useState(height);
  const [isBackgroundColorPickerVisible, setIsBackgroundColorPickerVisible] =
    useState(false);
  const [isStrokeColorPickerVisible, setIsStrokeColorPickerVisible] =
    useState(false);

  const {
    content,
    setContent,
    tool,
    setTool,
    currentColor,
    setCurrentColor,
    thickness: currentStrokeWidth,
    setThickness: setCurrentStrokeWidth,
    currentStroke,
    setCurrentStroke,
    stageRef,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp
  } = useDrawing(data.content || []);

  const updateNode = useStore((state) => state.updateNode);
  const backgroundColorPickerRef = useRef<HTMLDivElement>(null);
  const strokeColorPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    updateNode(data.id, {
      data: { title, content, tags, attachedFiles, backgroundColor, textColor }
    });
  }, [
    title,
    content,
    tags,
    attachedFiles,
    backgroundColor,
    textColor,
    updateNode,
    data.id
  ]);

  const onChangeTitle = (newTitle: string) => {
    handleTitleChange(data.id, newTitle, setTitle);
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

  const handleResize = (event, { width, height }) => {
    setNodeWidth(width);
    setNodeHeight(height);
    onNodeResizeStop(data.id, { width, height }, position);
  };

  const handleContainerClick = () => {
    setIsContainerSelected(true);
  };

  const handleContainerBlur = () => {
    setIsContainerSelected(false);
  };

  const toggleBackgroundColorPicker = () => {
    setIsBackgroundColorPickerVisible(!isBackgroundColorPickerVisible);
  };

  const toggleStrokeColorPicker = () => {
    setIsStrokeColorPickerVisible(!isStrokeColorPickerVisible);
  };

  const handleClickOutside = (event) => {
    if (
      backgroundColorPickerRef.current &&
      !backgroundColorPickerRef.current.contains(event.target)
    ) {
      setIsBackgroundColorPickerVisible(false);
    }
    if (
      strokeColorPickerRef.current &&
      !strokeColorPickerRef.current.contains(event.target)
    ) {
      setIsStrokeColorPickerVisible(false);
    }
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [backgroundColorPickerRef, strokeColorPickerRef]);

  const customStyles: CSSProperties = {
    width: nodeWidth,
    height: nodeHeight,
    backgroundColor,
    color: textColor,
    cursor: 'default'
  };

  return (
    <div
      className={`${styles.drawNode}`}
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
      <DrawingToolbar
        onToolSelect={(selectedTool) => {
          setTool(selectedTool);
        }}
        onUndo={() => undo(stageRef)}
        onRedo={() => redo(stageRef)}
        currentTool={tool}
        currentStroke={currentStroke}
        setCurrentStroke={setCurrentStroke}
        currentStrokeWidth={currentStrokeWidth}
        setCurrentStrokeWidth={setCurrentStrokeWidth}
      />
      <DrawingCanvas
        width={nodeWidth}
        height={nodeHeight - 100}
        initialContent={content}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        stageRef={stageRef}
      />
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
        <ChangeColorButton onClick={() => toggleBackgroundColorPicker()} />
        <AddTagButton onClick={() => handleAddTag(data.id, tags, onAddTag)} />
        <AttachFileButton
          onChange={(e) => handleAttachFile(data.id, onAttachFiles)(e)}
        />
        <DuplicateButton onClick={() => handleDuplicate(data.id)} />
        {isBackgroundColorPickerVisible && (
          <div
            className={`${styles.colorPicker} nodrag`}
            ref={backgroundColorPickerRef}
          >
            <SketchPicker
              color={backgroundColor}
              onChange={(color) =>
                handleBackgroundColorChange(
                  color,
                  setTextColor,
                  setBackgroundColor,
                  data.id
                )
              }
            />
          </div>
        )}
        {isStrokeColorPickerVisible && (
          <div
            className={`${styles.colorPicker} nodrag`}
            ref={strokeColorPickerRef}
          >
            <SketchPicker
              color={currentColor}
              onChange={(color) =>
                handleStrokeColorChange(color, setCurrentColor)
              }
            />
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
    </div>
  );
};

export default DrawNodeEdit;
