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
  handleChangeColor,
  handleSave,
  handleDelete,
  handleAddTag,
  handleAttachFile,
  handleClose,
  handleDuplicate,
  getContrastYIQ
} from '@/ui/canvasEditor/utils/CommonNodeFunctions';
import DrawingToolbar from '@/ui/nodes/drawNode/DrawingToolbar';
import { Stage, Layer, Line, Rect, Circle, Text } from 'react-konva';
import { undo, redo } from '@/ui/nodes/drawNode/drawFunctions';

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
  const [content, setContent] = useState(data.content || []);
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
  const [tool, setTool] = useState('pencil');
  const [currentColor, setCurrentColor] = useState({
    r: 255,
    g: 0,
    b: 0,
    a: 1
  });
  const [thickness, setThickness] = useState(5);
  const [isDrawing, setIsDrawing] = useState(false);

  const updateNode = useStore((state) => state.updateNode);
  const backgroundColorPickerRef = useRef<HTMLDivElement>(null);
  const strokeColorPickerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);

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

  const handleBackgroundColorChange = (color) => {
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

  const handleMouseDown = (e) => {
    const stage = stageRef.current;
    if (!stage) return;
    const pos = stage.getPointerPosition();
    if (!pos) return;

    const newShape = {
      tool,
      points: [pos.x, pos.y],
      stroke: `rgba(${currentColor.r}, ${currentColor.g}, ${currentColor.b}, ${currentColor.a})`,
      strokeWidth: thickness,
      fill: 'transparent'
    };

    setContent([...content, newShape]);
    setIsDrawing(true);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const stage = stageRef.current;
    if (!stage) return;
    const pos = stage.getPointerPosition();
    if (!pos) return;

    const lastShape = content[content.length - 1];
    if (!lastShape) return;

    const newPoints = [...lastShape.points, pos.x, pos.y];
    const updatedShape = { ...lastShape, points: newPoints };

    setContent([...content.slice(0, -1), updatedShape]);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleStrokeColorChange = (color) => {
    setCurrentColor(color.rgb);
  };

  const handleStrokeWidthChange = (event) => {
    setThickness(parseInt(event.target.value, 10));
  };

  const handleAddText = () => {
    const text = prompt('Enter text:');
    if (text) {
      const stage = stageRef.current;
      if (!stage) return;
      const pos = stage.getPointerPosition();
      if (!pos) return;

      const newText = {
        tool: 'text',
        text,
        x: pos.x,
        y: pos.y,
        fontSize: 20,
        fontFamily: 'Arial',
        fill: `rgba(${currentColor.r}, ${currentColor.g}, ${currentColor.b}, ${currentColor.a})`
      };

      setContent([...content, newText]);
    }
  };

  const customStyles: CSSProperties = {
    width: nodeWidth,
    height: nodeHeight,
    backgroundColor,
    color: textColor,
    cursor: 'default'
  };

  return (
    <div
      className={`${styles.drawNode} ${styles[tool]}`}
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
        onStrokeColorChange={toggleStrokeColorPicker}
        onFillColorChange={toggleStrokeColorPicker}
        onStrokeWidthChange={handleStrokeWidthChange}
        strokeWidth={thickness}
      />
      <div className={styles.canvasContainer}>
        <Stage
          width={nodeWidth}
          height={nodeHeight - 100}
          ref={stageRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className={`nodrag nowheel ${styles[tool]}`}
        >
          <Layer>
            {content.map((shape, i) => {
              switch (shape.tool) {
                case 'pencil':
                case 'marker':
                case 'eraser':
                  return (
                    <Line
                      key={i}
                      points={shape.points}
                      stroke={shape.stroke}
                      strokeWidth={shape.strokeWidth}
                      globalCompositeOperation={
                        shape.tool === 'eraser'
                          ? 'destination-out'
                          : 'source-over'
                      }
                    />
                  );
                case 'rectangle':
                  return (
                    <Rect
                      key={i}
                      x={shape.points[0]}
                      y={shape.points[1]}
                      width={shape.points[2] - shape.points[0]}
                      height={shape.points[3] - shape.points[1]}
                      stroke={shape.stroke}
                      strokeWidth={shape.strokeWidth}
                      fill={shape.fill}
                    />
                  );
                case 'circle':
                  const radius = Math.sqrt(
                    Math.pow(shape.points[2] - shape.points[0], 2) +
                      Math.pow(shape.points[3] - shape.points[1], 2)
                  );
                  return (
                    <Circle
                      key={i}
                      x={shape.points[0]}
                      y={shape.points[1]}
                      radius={radius}
                      stroke={shape.stroke}
                      strokeWidth={shape.strokeWidth}
                      fill={shape.fill}
                    />
                  );
                case 'text':
                  return (
                    <Text
                      key={i}
                      text={shape.text}
                      x={shape.x}
                      y={shape.y}
                      fontSize={shape.fontSize}
                      fontFamily={shape.fontFamily}
                      fill={shape.fill}
                    />
                  );
                default:
                  return null;
              }
            })}
          </Layer>
        </Stage>
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
              onChange={handleBackgroundColorChange}
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
              onChange={handleStrokeColorChange}
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
